import { useEffect, useState } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import { purchaseOrdersAPI } from '@api/purchaseOrders.js';
import { productsAPI } from '@api/products.js';
import { storesAPI } from '@api/stores.js';
import { formatDate } from '@utils/formatDate.js';
import { formatCurrency } from '@utils/formatCurrency.js';
import { ROLES } from '@utils/roles.js';
import Button from '@components/common/Button.jsx';
import Input from '@components/common/Input.jsx';
import Loading from '@components/common/Loading.jsx';

const PurchaseOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    supplierName: '',
    items: [{ product: '', batchNumber: '', quantity: 0, unitPrice: 0 }],
    expectedDeliveryDate: ''
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

  useEffect(() => {
    loadOrders();
    loadProducts();
    if (user?.role === ROLES.ADMIN) {
      loadStores();
    }
  }, [storeId]);

  useEffect(() => {
    // Set initial selected store for ADMIN if they have one assigned
    if (user?.role === ROLES.ADMIN && user?.store && !selectedStoreId) {
      const userStoreId = user.store._id ? user.store._id.toString() : user.store.toString();
      setSelectedStoreId(userStoreId);
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrdersAPI.getAll(storeId);
      setOrders(data);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsAPI.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadStores = async () => {
    try {
      const data = await storesAPI.getStores();
      setStores(data);
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  const handleReceive = async (id) => {
    if (!window.confirm('Mark this purchase order as received?')) return;
    try {
      setProcessing(true);
      setError('');
      await purchaseOrdersAPI.receive(id, storeId);
      setSuccess('Purchase order received successfully!');
      loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to receive order');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product: '', batchNumber: '', quantity: 0, unitPrice: 0 }]
    });
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = field === 'quantity' || field === 'unitPrice' 
      ? parseFloat(value) || 0 
      : value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.supplierName.trim()) {
      setError('Supplier name is required');
      return;
    }

    if (formData.items.length === 0 || formData.items.some(item => !item.product || item.quantity <= 0)) {
      setError('Please add at least one valid item');
      return;
    }

    // Validate storeId
    if (!storeId) {
      if (user?.role === ROLES.ADMIN) {
        setError('Please select a store before creating a purchase order.');
      } else {
        setError('Store ID is required. Please ensure you are assigned to a store.');
      }
      console.error('Store ID missing:', { user, storeId, selectedStoreId });
      return;
    }

    // Validate batch numbers
    const itemsWithMissingBatch = formData.items.filter(item => !item.batchNumber || item.batchNumber.trim() === '');
    if (itemsWithMissingBatch.length > 0) {
      setError('Please select or enter a batch number for all items.');
      return;
    }

    try {
      setProcessing(true);
      const items = formData.items.map(item => {
        // Ensure batch number is provided and trimmed
        let batchNumber = item.batchNumber ? item.batchNumber.trim() : '';
        if (!batchNumber) {
          // Generate default batch number if none provided
          const selectedProduct = products.find(p => p._id === item.product);
          if (selectedProduct) {
            const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
            const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
            batchNumber = `${selectedProduct.sku}-${dateStr}-${suffix}`;
          } else {
            batchNumber = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          }
        }
        return {
          product: item.product,
          batchNumber: batchNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        };
      });

      console.log('Creating PO with storeId:', storeId);
      await purchaseOrdersAPI.create(storeId, formData.supplierName, items);
      setSuccess('Purchase order created successfully!');
      setFormData({
        supplierName: '',
        items: [{ product: '', batchNumber: '', quantity: 0, unitPrice: 0 }],
        expectedDeliveryDate: ''
      });
      setShowCreateForm(false);
      loadOrders();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create purchase order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Purchase Orders</h1>
        <div className="flex gap-4 items-center">
          {user?.role === ROLES.ADMIN && stores.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Store
              </label>
              <select
                value={selectedStoreId || ''}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
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
          <Button
            variant="primary"
            onClick={() => {
              setShowCreateForm(true);
              setError('');
              setSuccess('');
            }}
            disabled={!storeId}
          >
            + Create Purchase Order
          </Button>
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

      {showCreateForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Create Purchase Order
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Supplier Name *"
              value={formData.supplierName}
              onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              required
              placeholder="e.g., ABC Suppliers"
            />
            <Input
              label="Expected Delivery Date (Optional)"
              type="date"
              value={formData.expectedDeliveryDate}
              onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Items *
                </label>
                <Button type="button" variant="secondary" onClick={handleAddItem} className="text-sm py-1 px-2">
                  + Add Item
                </Button>
              </div>
              {formData.items.map((item, index) => (
                <div key={index} className="mb-4 p-4 border dark:border-gray-700 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product *
                      </label>
                      <select
                        value={item.product}
                        onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.sku} - {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Batch Number *
                      </label>
                      {item.product ? (
                        <>
                          <select
                            value={item.batchNumber || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'custom') {
                                // Clear to show custom input
                                handleItemChange(index, 'batchNumber', '');
                              } else if (val && val !== '') {
                                // Set the selected batch number
                                handleItemChange(index, 'batchNumber', val);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select batch number</option>
                            {(() => {
                              const selectedProduct = products.find(p => p._id === item.product);
                              if (selectedProduct) {
                                const suggestions = [];
                                const today = new Date();
                                const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
                                
                                // Generate 5 suggested batch numbers
                                for (let i = 0; i < 5; i++) {
                                  const suffix = Math.random().toString(36).substr(2, 4).toUpperCase();
                                  suggestions.push(`${selectedProduct.sku}-${dateStr}-${suffix}`);
                                }
                                
                                return (
                                  <>
                                    {suggestions.map((batch, idx) => (
                                      <option key={idx} value={batch}>
                                        {batch}
                                      </option>
                                    ))}
                                    <option value="custom">-- Enter Custom Batch --</option>
                                  </>
                                );
                              }
                              return null;
                            })()}
                          </select>
                          {(!item.batchNumber || item.batchNumber === '') && (
                            <input
                              type="text"
                              value={item.batchNumber || ''}
                              onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                              placeholder="Or enter custom batch number"
                              className="w-full mt-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                          )}
                        </>
                      ) : (
                        <input
                          type="text"
                          value=""
                          placeholder="Select product first"
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                        />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Quantity *"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                    />
                    <Input
                      label="Unit Price *"
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      required
                    />
                    <div className="flex items-end">
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleRemoveItem(index)}
                          className="w-full"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Line Total: {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit" variant="primary" disabled={processing}>
                {processing ? 'Creating...' : 'Create PO'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({
                    supplierName: '',
                    items: [{ product: '', batchNumber: '', quantity: 0, unitPrice: 0 }],
                    expectedDeliveryDate: ''
                  });
                  setError('');
                  setSuccess('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  PO ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No purchase orders found. Create your first purchase order!
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.supplierName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {order.items?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'RECEIVED'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                            : order.status === 'CANCELLED'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.status === 'PENDING' && (
                        <Button
                          variant="success"
                          onClick={() => handleReceive(order._id)}
                          disabled={processing}
                        >
                          Receive
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;