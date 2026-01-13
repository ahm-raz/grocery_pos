import apiClient from './axios.js';

export const cartAPI = {
  getCart: async (storeId) => {
    const params = storeId ? { storeId } : {};
    const response = await apiClient.get('/pos/cart', { params });
    return response.data;
  },
  addItem: async (storeId, productId, quantity) => {
    const body = { productId, quantity };
    // Only include storeId if provided (backend will use req.userStoreId as fallback)
    if (storeId) {
      body.storeId = storeId;
    }
    const response = await apiClient.post('/pos/cart/add', body);
    return response.data;
  },
  updateItem: async (storeId, productId, quantity) => {
    const body = { productId, quantity };
    // Only include storeId if provided (backend will use req.userStoreId as fallback)
    if (storeId) {
      body.storeId = storeId;
    }
    const response = await apiClient.put('/pos/cart/update', body);
    return response.data;
  },
  removeItem: async (storeId, productId) => {
    const data = { productId };
    // Only include storeId if provided (backend will use req.userStoreId as fallback)
    if (storeId) {
      data.storeId = storeId;
    }
    const response = await apiClient.delete('/pos/cart/remove', { data });
    return response.data;
  },
  checkout: async (storeId, payments, tax = 0) => {
    const body = { payments, tax };
    // Only include storeId if provided (backend will use req.userStoreId as fallback)
    if (storeId) {
      body.storeId = storeId;
    }
    const response = await apiClient.post('/pos/checkout', body);
    return response.data;
  },
};
