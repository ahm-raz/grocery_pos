import apiClient from './axios.js';

export const receiptsAPI = {
  getReceipt: async (orderId) => {
    const response = await apiClient.get(`/receipts/${orderId}`, {
      responseType: 'text',
    });
    return response.data;
  },
};
