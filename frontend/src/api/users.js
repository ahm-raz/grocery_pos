import apiClient from './axios.js';

export const usersAPI = {
  getUsers: async (storeId, includeInactive = false) => {
    const params = {};
    if (storeId) {
      params.storeId = storeId;
    }
    if (includeInactive) {
      params.includeInactive = 'true';
    }
    const response = await apiClient.get('/users', { params });
    return response.data;
  },
  getUser: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  createUser: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
  activateUser: async (id) => {
    const response = await apiClient.put(`/users/${id}/activate`);
    return response.data;
  },
  permanentDeleteUser: async (id) => {
    const response = await apiClient.delete(`/users/${id}/permanent`);
    return response.data;
  },
};

