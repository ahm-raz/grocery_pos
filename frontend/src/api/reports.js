import apiClient from './axios.js';

export const reportsAPI = {
  getSales: async (storeId, startDate, endDate, limit) => {
    const params = {};
    if (storeId) params.storeId = storeId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (limit) params.limit = limit;
    const response = await apiClient.get('/reports/sales', { params });
    return response.data;
  },
  getInventory: async (storeId, limit) => {
    const params = {};
    if (storeId) params.storeId = storeId;
    if (limit) params.limit = limit;
    const response = await apiClient.get('/reports/inventory', { params });
    return response.data;
  },
  getTransactions: async (storeId, productId, startDate, endDate, reason, limit) => {
    const params = {};
    if (storeId) params.storeId = storeId;
    if (productId) params.productId = productId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (reason) params.reason = reason;
    if (limit) params.limit = limit;
    const response = await apiClient.get('/reports/transactions', { params });
    return response.data;
  },
  getPayments: async (storeId, startDate, endDate) => {
    const params = {};
    if (storeId) params.storeId = storeId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const response = await apiClient.get('/reports/payments', { params });
    return response.data;
  },
};
