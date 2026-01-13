import apiClient from './axios.js';

export const storesAPI = {
  getStores: async () => {
    const response = await apiClient.get('/store');
    return response.data;
  },
  getStore: async (id) => {
    const response = await apiClient.get(`/store/${id}`);
    return response.data;
  },
  createStore: async (storeData) => {
    const response = await apiClient.post('/store', storeData);
    return response.data;
  },
};

