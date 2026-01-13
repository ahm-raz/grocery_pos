import apiClient from './axios.js';

export const alertsAPI = {
  getExpiring: async (storeId, daysWarning = 7) => {
    const params = { daysWarning };
    if (storeId) params.storeId = storeId;
    const response = await apiClient.get('/alerts/expiring', { params });
    return response.data;
  },
  getInventoryAlerts: async (storeId, daysWarning = 7) => {
    const params = { daysWarning };
    if (storeId) params.storeId = storeId;
    const response = await apiClient.get('/alerts/inventory', { params });
    return response.data;
  },
};
