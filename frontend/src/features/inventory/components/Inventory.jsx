import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import { inventoryAPI } from '@api/inventory.js';
import { productsAPI } from '@api/products.js';
import { storesAPI } from '@api/stores.js';
import { formatCurrency } from '@utils/formatCurrency.js';
import { ROLES } from '@utils/roles.js';
import Loading from '@components/common/Loading.jsx';
import Button from '@components/common/Button.jsx';
import Input from '@components/common/Input.jsx';

const Inventory = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStockForm, setShowStockForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockFormData, setStockFormData] = useState({
    changeType: 'IN',
    quantity: 0,
    reason: 'RESTOCK',
    batchNumber: '',
    expiryDate: ''
  });
  const [showCreateInventoryForm, setShowCreateInventoryForm] = useState(false);
  const [createInventoryData, setCreateInventoryData] = useState({
    product: '',
    lowStockThreshold: 10
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Get storeId - handle both populated and non-populated store objects
  // For ADMIN, allow selecting a store; for others, use their assigned store
  const getStoreId = () => {
    if (user?.role === ROLES.ADMIN && selectedStoreId) {
      return selectedStoreId;
    }
    // Handle both populated store object and store ID string
    if (user?.store) {
      return user.store._id ? user.store._id.toString() : user.store.toString();
    }
    return null;
  };
  const storeId = getStoreId();

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
    loadInventory();
    loadProducts();
  }, [storeId]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const currentStoreId = getStoreId();
      // ADMIN can view all inventory if no store selected, but operations require store
      const data = await inventoryAPI.getInventory(currentStoreId);
      setInventory(data || []);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleCreateInventory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      if (user?.role === ROLES.ADMIN) {
        setError('Please select a store to create inventory entry');
      } else {
        setError('Store ID is required. Please ensure you are assigned to a store.');
      }
      return;
    }

    try {
      await inventoryAPI.createInventory({
        ...createInventoryData,
        store: currentStoreId
      });
      setSuccess('Inventory entry created successfully!');
      setShowCreateInventoryForm(false);
      setCreateInventoryData({ product: '', lowStockThreshold: 10 });
      loadInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create inventory entry');
    }
  };

  const handleStockAdjustment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const currentStoreId = getStoreId();
    if (!currentStoreId) {
      if (user?.role === ROLES.ADMIN) {
        setError('Please select a store to adjust stock');
      } else {
        setError('Store ID is required. Please ensure you are assigned to a store.');
      }
      return;
    }

    try {
      const adjustmentData = {
        productId: selectedProduct.product._id || selectedProduct.product,
        storeId: currentStoreId,
        changeType: stockFormData.changeType,
        quantity: stockFormData.quantity,
        reason: stockFormData.reason
      };

      if (stockFormData.changeType === 'IN') {
        if (!stockFormData.batchNumber) {
          setError('Batch number is required for stock IN');
          return;
        }
        adjustmentData.batchNumber = stockFormData.batchNumber;
        if (stockFormData.expiryDate) {
          adjustmentData.expiryDate = new Date(stockFormData.expiryDate).toISOString();
        }
      }

      await inventoryAPI.adjustStock(adjustmentData);
      setSuccess(`Stock ${stockFormData.changeType === 'IN' ? 'added' : 'removed'} successfully!`);
      setShowStockForm(false);
      setSelectedProduct(null);
      setStockFormData({
        changeType: 'IN',
        quantity: 0,
        reason: 'RESTOCK',
        batchNumber: '',
        expiryDate: ''
      });
      loadInventory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to adjust stock');
    }
  };

  const openStockForm = (item) => {
    setSelectedProduct(item);
    setShowStockForm(true);
    setError('');
    setSuccess('');
  };

  if (loading) return <Loading />;

  const productsWithoutInventory = products.filter(
    (product) => !inventory.some((inv) => 
      (inv.product._id || inv.product).toString() === product._id.toString()
    )
  );

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Inventory
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
          {user?.role === ROLES.ADMIN && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">Store:</label>
              <select
                value={selectedStoreId || ''}
                onChange={(e) => {
                  setSelectedStoreId(e.target.value);
                  setInventory([]); // Clear inventory when store changes
                }}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
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
          {productsWithoutInventory.length > 0 && (
            <Button
              variant="secondary"
              onClick={() => setShowCreateInventoryForm(true)}
              className="w-full sm:w-auto"
            >
              + Create Inventory Entry
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showCreateInventoryForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Create Inventory Entry
          </h2>
          <form onSubmit={handleCreateInventory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product *
              </label>
              <select
                value={createInventoryData.product}
                onChange={(e) => setCreateInventoryData({ ...createInventoryData, product: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a product</option>
                {productsWithoutInventory.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Low Stock Threshold"
              type="number"
              min="0"
              value={createInventoryData.lowStockThreshold}
              onChange={(e) => setCreateInventoryData({ ...createInventoryData, lowStockThreshold: parseInt(e.target.value) || 0 })}
              required
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary">Create</Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateInventoryForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {showStockForm && selectedProduct && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Adjust Stock: {selectedProduct.product?.name || 'Unknown'}
          </h2>
          <form onSubmit={handleStockAdjustment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={stockFormData.changeType}
                onChange={(e) => setStockFormData({ ...stockFormData, changeType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="IN">Stock IN (Add)</option>
                <option value="OUT">Stock OUT (Remove)</option>
              </select>
            </div>
            <Input
              label="Quantity"
              type="number"
              min="0"
              step="0.01"
              value={stockFormData.quantity}
              onChange={(e) => setStockFormData({ ...stockFormData, quantity: parseFloat(e.target.value) || 0 })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason *
              </label>
              <select
                value={stockFormData.reason}
                onChange={(e) => setStockFormData({ ...stockFormData, reason: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="RESTOCK">RESTOCK</option>
                <option value="DAMAGE">DAMAGE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="MANUAL">MANUAL</option>
                <option value="PO_RECEIPT">PO_RECEIPT</option>
              </select>
            </div>
            {stockFormData.changeType === 'IN' && (
              <>
                <Input
                  label="Batch Number *"
                  value={stockFormData.batchNumber}
                  onChange={(e) => setStockFormData({ ...stockFormData, batchNumber: e.target.value })}
                  required
                  placeholder="e.g., BATCH-001"
                />
                <Input
                  label="Expiry Date (Optional)"
                  type="date"
                  value={stockFormData.expiryDate}
                  onChange={(e) => setStockFormData({ ...stockFormData, expiryDate: e.target.value })}
                />
              </>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="primary">Adjust Stock</Button>
              <Button type="button" variant="secondary" onClick={() => {
                setShowStockForm(false);
                setSelectedProduct(null);
              }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Low Stock Threshold
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Batches
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No inventory found. Create an inventory entry for a product!
                  </td>
                </tr>
              ) : (
                inventory.map((item) => {
                  const totalQuantity = item.quantity || item.batches?.reduce((sum, batch) => sum + batch.quantity, 0) || 0;
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                          {item.product?.name || 'Unknown'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{item.product?.sku}</div>
                        <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Threshold: {item.lowStockThreshold}
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {totalQuantity}
                      </td>
                      <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.lowStockThreshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {totalQuantity === 0 ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                            Out of Stock
                          </span>
                        ) : totalQuantity <= item.lowStockThreshold ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400">
                            Low Stock
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="hidden lg:table-cell px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.batches?.length || 0} batch(es)
                        {item.batches && item.batches.length > 0 && (
                          <div className="text-xs mt-1">
                            {item.batches.slice(0, 2).map((batch, idx) => (
                              <div key={idx}>
                                {batch.batchNumber}: {batch.quantity}
                                {batch.expiryDate && ` (exp: ${new Date(batch.expiryDate).toLocaleDateString()})`}
                              </div>
                            ))}
                            {item.batches.length > 2 && <div>+{item.batches.length - 2} more</div>}
                          </div>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => openStockForm(item)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors text-xs sm:text-sm"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;

