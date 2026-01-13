import apiClient from './axios.js';

export const purchaseOrdersAPI = {
  getAll: async (storeId, status) => {
    const params = {};
    if (storeId) params.storeId = storeId;
    if (status) params.status = status;
    const response = await apiClient.get('/purchase-orders', { params });
    return response.data;
  },
  create: async (storeId, supplierName, items) => {
    const response = await apiClient.post('/purchase-orders', {
      storeId,
      supplierName,
      items,
    });
    return response.data;
  },
  receive: async (id, storeId) => {
    const response = await apiClient.put(`/purchase-orders/${id}/receive`, {
      storeId,
    });
    return response.data;
  },
};
