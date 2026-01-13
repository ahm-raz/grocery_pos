import { useState, useEffect, useRef, useCallback } from 'react';
import { LazyMotion, m } from 'framer-motion';
import { useAuth } from '@context/AuthContext.jsx';
import { productsAPI, cartAPI, storesAPI } from '@api';
import { formatCurrency } from '@utils/formatCurrency.js';
import { ROLES } from '@utils/roles.js';
import Button from '@components/common/Button.jsx';
import Input from '@components/common/Input.jsx';
import Loading from '@components/common/Loading.jsx';
import PaymentModal from '@components/common/PaymentModal.jsx';
import ReceiptModal from '@components/common/ReceiptModal.jsx';

const loadFeatures = () => import('framer-motion').then((res) => res.domAnimation);

const POS = () => {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState(null);
  const [tax] = useState(0);
  const searchInputRef = useRef(null);
  
  // Get storeId - handle both populated and non-populated store objects
  // For ADMIN, allow selecting a store; for others, use their assigned store
  const getStoreId = () => {
    if (!user) return null;
    // ADMIN can select a store
    if (user.role === ROLES.ADMIN && selectedStoreId) {
      return selectedStoreId;
    }
    // Handle both populated store object and store ID string
    if (user.store) {
      return user.store._id ? user.store._id.toString() : user.store.toString();
    }
    return null;
  };
  const storeId = getStoreId();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const currentStoreId = getStoreId();
      // ADMIN can load products without storeId, but cart requires storeId
      if (!currentStoreId && user?.role !== 'ADMIN') {
        setError('Store ID is required. Please ensure you are assigned to a store.');
        setLoading(false);
        setCart({ items: [], subtotal: 0 });
        return;
      }
      
      const [productsData, cartData] = await Promise.all([
        productsAPI.getPOSProducts(currentStoreId),
        currentStoreId ? cartAPI.getCart(currentStoreId) : Promise.resolve({ items: [], subtotal: 0 }),
      ]);
      setProducts(productsData || []);
      setCart(cartData || { items: [], subtotal: 0 });
    } catch (error) {
      console.error('Error loading POS data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load data';
      setError(errorMessage);
      // Set empty cart on error to prevent UI issues
      setCart({ items: [], subtotal: 0 });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load stores for ADMIN users
  useEffect(() => {
    if (user?.role === ROLES.ADMIN) {
      const loadStores = async () => {
        try {
          const storesData = await storesAPI.getStores();
          setStores(storesData || []);
          // Auto-select first store if available and none selected
          if (storesData && storesData.length > 0 && !selectedStoreId) {
            setSelectedStoreId(storesData[0]._id);
          }
        } catch (error) {
          console.error('Error loading stores:', error);
        }
      };
      loadStores();
    }
  }, [user]);

  useEffect(() => {
    // Wait for auth to finish loading before checking storeId
    if (authLoading) {
      return; // Auth still loading, wait
    }
    
    // ADMIN can use POS without storeId for viewing/searching, but need storeId for cart operations
    if (storeId || user?.role === ROLES.ADMIN) {
      loadData();
    } else {
      // If no storeId and not ADMIN, stop loading and show error
      setLoading(false);
      setError('Store ID is required. Please ensure you are assigned to a store.');
      setCart({ items: [], subtotal: 0 });
    }
  }, [storeId, user, authLoading, loadData, selectedStoreId]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      setIsSearching(false);
      loadData();
      return;
    }
    try {
      setProcessing(true);
      setIsSearching(true);
      const currentStoreId = getStoreId();
      // ADMIN can search without storeId, others need storeId
      if (!currentStoreId && user?.role !== 'ADMIN') {
        setError('Store ID is required. Please ensure you are assigned to a store.');
        setTimeout(() => setError(''), 5000);
        setProcessing(false);
        setIsSearching(false);
        return;
      }
      // Pass null/undefined for ADMIN if no storeId
      const results = await productsAPI.searchProducts(currentStoreId || null, trimmedQuery);
      setProducts(results || []);
      if (!results || results.length === 0) {
        setSuccess('No products found matching your search');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setSuccess(`Found ${results.length} product(s)`);
        setTimeout(() => setSuccess(''), 2000);
      }
      searchInputRef.current?.focus();
    } catch (error) {
      console.error('Error searching products:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Search failed';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      // Reload all products on error
      try {
        const currentStoreId = getStoreId();
        const productsData = await productsAPI.getPOSProducts(currentStoreId || null);
        setProducts(productsData || []);
      } catch (reloadError) {
        console.error('Error reloading products:', reloadError);
      }
      setIsSearching(false);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      // Get current storeId - required for cart operations
      const currentStoreId = getStoreId();
      if (!currentStoreId) {
        if (user?.role === ROLES.ADMIN) {
          setError('Please select a store to add items to cart');
        } else {
          setError('Store ID is required. Please ensure you are assigned to a store.');
        }
        setTimeout(() => setError(''), 5000);
        setProcessing(false);
        return;
      }
      
      const updatedCart = await cartAPI.addItem(currentStoreId, product.productId, 1);
      setCart(updatedCart || { items: [], subtotal: 0 });
      setSuccess('Item added to cart');
      setTimeout(() => setSuccess(''), 2000);
      searchInputRef.current?.focus();
    } catch (error) {
      console.error('Error adding item to cart:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add item to cart';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      // Get current storeId (optional - backend will use req.userStoreId as fallback)
      const currentStoreId = getStoreId();
      
      const updatedCart = await cartAPI.updateItem(currentStoreId, productId, newQuantity);
      setCart(updatedCart || { items: [], subtotal: 0 });
    } catch (error) {
      console.error('Error updating quantity:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update quantity';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      // Reload cart to get current state
      const currentStoreId = getStoreId();
      if (currentStoreId) {
        try {
          const currentCart = await cartAPI.getCart(currentStoreId);
          setCart(currentCart || { items: [], subtotal: 0 });
        } catch (reloadError) {
          console.error('Error reloading cart:', reloadError);
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      
      // Get current storeId (optional - backend will use req.userStoreId as fallback)
      const currentStoreId = getStoreId();
      
      const updatedCart = await cartAPI.removeItem(currentStoreId, productId);
      setCart(updatedCart || { items: [], subtotal: 0 });
      setSuccess('Item removed from cart');
      setTimeout(() => setSuccess(''), 2000);
    } catch (error) {
      console.error('Error removing item:', error);
      const errorMessage = error.response?.data?.error || 'Failed to remove item';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      // Reload cart to get current state
      const currentStoreId = getStoreId();
      if (currentStoreId) {
        try {
          const currentCart = await cartAPI.getCart(currentStoreId);
          setCart(currentCart || { items: [], subtotal: 0 });
        } catch (reloadError) {
          console.error('Error reloading cart:', reloadError);
        }
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckoutClick = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setError('Cart is empty');
      return;
    }
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async (payments, taxAmount) => {
    try {
      setProcessing(true);
      setError('');
      setSuccess('');
      // Get current storeId (optional - backend will use req.userStoreId as fallback)
      const currentStoreId = getStoreId();
      const order = await cartAPI.checkout(currentStoreId, payments, taxAmount);
      setSuccess('Checkout successful!');
      setCart({ items: [], subtotal: 0 });
      setShowPaymentModal(false);
      setCompletedOrderId(order?._id || order?.id || null);
      setShowReceiptModal(true);
      // Reload products to refresh availability
      if (currentStoreId) {
        try {
          const productsData = await productsAPI.getPOSProducts(currentStoreId);
          setProducts(productsData || []);
        } catch (reloadError) {
          console.error('Error reloading products:', reloadError);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Checkout failed';
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
      throw new Error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) return <Loading />;

  // When searching, show all products (including out of stock)
  // When not searching, filter out out-of-stock products
  const filteredProducts = isSearching 
    ? products 
    : products.filter((p) => !p.isOutOfStock);

  return (
    <LazyMotion features={loadFeatures} strict>
      <div className="px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Selection</h1>
                {user?.role === ROLES.ADMIN && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Store:</label>
                    <select
                      value={selectedStoreId || ''}
                      onChange={(e) => {
                        setSelectedStoreId(e.target.value);
                        setCart({ items: [], subtotal: 0 }); // Clear cart when store changes
                      }}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    >
                      <option value="">Select a store</option>
                      {stores.map((store) => (
                        <option key={store._id} value={store._id}>
                          {store.name} ({store.storeCode})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <form onSubmit={handleSearch} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search by SKU, barcode, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={processing}>
                    Search
                  </Button>
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setError('');
                        setSuccess('');
                        setIsSearching(false);
                        loadData();
                      }}
                      disabled={processing}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </form>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <m.button
                      key={product.productId}
                      onClick={() => handleAddToCart(product)}
                      disabled={processing || product.isOutOfStock}
                      className="p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-left disabled:opacity-50 dark:bg-gray-800"
                      whileHover={!processing && !product.isOutOfStock ? { scale: 1.02 } : {}}
                      whileTap={!processing && !product.isOutOfStock ? { scale: 0.98 } : {}}
                      transition={{ duration: 0.1 }}
                    >
                      <div className="font-semibold text-sm dark:text-white">{product.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">SKU: {product.sku}</div>
                      <div className="text-lg font-bold mt-2 dark:text-white">{formatCurrency(product.price || 0)}</div>
                      {product.isLowStock && (
                        <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Low Stock</div>
                      )}
                      {product.isOutOfStock && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">Out of Stock</div>
                      )}
                    </m.button>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                    {searchQuery ? 'No products found matching your search' : 'No products available'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cart</h2>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-3 py-2 rounded mb-4 text-sm">
                  {success}
                </div>
              )}
              <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto">
                {cart && cart.items && cart.items.length > 0 ? (
                  cart.items.map((item) => {
                    const productId = item.product?._id || item.product;
                    if (!productId) return null;
                    return (
                      <div key={productId} className="flex items-center justify-between p-2 border dark:border-gray-700 rounded dark:bg-gray-700">
                        <div className="flex-1">
                          <div className="font-medium text-sm dark:text-white">
                            {item.product?.name || 'Unknown Product'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(item.unitPrice || 0)} × {item.quantity || 0}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQuantity(productId, (item.quantity || 1) - 1)}
                            disabled={processing}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 dark:text-white rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm dark:text-white">{item.quantity || 0}</span>
                          <button
                            onClick={() => handleUpdateQuantity(productId, (item.quantity || 0) + 1)}
                            disabled={processing}
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 dark:text-white rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveItem(productId)}
                            disabled={processing}
                            className="ml-2 text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300 disabled:opacity-50"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Cart is empty</p>
                )}
              </div>
              <div className="border-t dark:border-gray-700 pt-4">
                <div className="flex justify-between text-lg font-bold mb-4 dark:text-white">
                  <span>Total:</span>
                  <span>{formatCurrency(cart?.subtotal || 0)}</span>
                </div>
                <Button
                  variant="success"
                  onClick={handleCheckoutClick}
                  disabled={processing || !cart || !cart.items || cart.items.length === 0}
                  className="w-full"
                >
                  {processing ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          subtotal={cart?.subtotal || 0}
          tax={tax}
          onConfirm={handlePaymentConfirm}
        />

        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setCompletedOrderId(null);
          }}
          orderId={completedOrderId}
        />
      </div>
    </LazyMotion>
  );
};

export default POS;

