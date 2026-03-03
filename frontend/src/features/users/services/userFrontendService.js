import axios from 'axios';

import { API_URL } from '@/core/config';

// Create an Axios instance
const apiClient = axios.create({
    baseURL: API_URL,
});

// Request interceptor to attach token
apiClient.interceptors.request.use((config) => {
    // Check localStorage for the token
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// For this MVP we will rely on this configured instance
export const userFrontendService = {
    getUsers: async ({ page = 1, is_active, search } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (is_active !== undefined && is_active !== null && is_active !== '') {
            params.append('is_active', is_active);
        }
        if (search) params.append('search', search);

        const response = await apiClient.get(`users/?${params.toString()}`);
        return response.data;
    },

    createUser: async (userData) => {
        const response = await apiClient.post(`users/`, userData);
        return response.data;
    },

    getUserById: async (id) => {
        const response = await apiClient.get(`users/${id}/`);
        return response.data;
    },

    updateUser: async (id, userData) => {
        const response = await apiClient.patch(`users/${id}/`, userData);
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await apiClient.delete(`users/${id}/`);
        return response.data; // Usually 204 No Content
    }
};
