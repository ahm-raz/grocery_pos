import apiClient from './axios.js';

export const inventoryAPI = {
  getInventory: async (storeId) => {
    const params = storeId ? { storeId } : {};
    const response = await apiClient.get('/inventory', { params });
    return response.data;
  },
  getLowStock: async (storeId) => {
    const params = storeId ? { storeId } : {};
    const response = await apiClient.get('/inventory/low-stock', { params });
    return response.data;
  },
  createInventory: async (inventoryData) => {
    const response = await apiClient.post('/inventory', inventoryData);
    return response.data;
  },
  adjustStock: async (adjustmentData) => {
    const response = await apiClient.post('/inventory/adjust', adjustmentData);
    return response.data;
  },
  getInventoryHistory: async (productId, storeId) => {
    const params = storeId ? { storeId } : {};
    const response = await apiClient.get(`/inventory/${productId}/history`, { params });
    return response.data;
  },
};
