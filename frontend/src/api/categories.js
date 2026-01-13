import apiClient from './axios.js';

export const categoriesAPI = {
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
  getCategory: async (id) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },
  createCategory: async (categoryData) => {
    const response = await apiClient.post('/categories', categoryData);
    return response.data;
  },
  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}`, categoryData);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};
