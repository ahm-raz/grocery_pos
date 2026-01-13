import apiClient from './axios.js';

export const productsAPI = {
  getPOSProducts: async (storeId) => {
    const params = {};
    // Only include storeId if provided (ADMIN can search without storeId)
    if (storeId) {
      params.storeId = storeId;
    }
    const response = await apiClient.get('/pos/products', { params });
    return response.data;
  },
  searchProducts: async (storeId, query) => {
    const params = { q: query };
    // Only include storeId if provided (ADMIN can search without storeId)
    if (storeId) {
      params.storeId = storeId;
    }
    const response = await apiClient.get('/pos/products/search', { params });
    return response.data;
  },
  getProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data;
  },
  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};
