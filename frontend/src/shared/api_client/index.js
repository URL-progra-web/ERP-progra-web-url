import axios from 'axios';
import { API_URL } from '@/core/config';

// Create an Axios instance
export const apiClient = axios.create({
    baseURL: API_URL,
});

// Request interceptor to attach token
apiClient.interceptors.request.use(
    (config) => {
        // Check localStorage for the token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const api = {
    get: async (url, config = {}) => {
        const response = await apiClient.get(url, config);
        return response.data;
    },
    post: async (url, data, config = {}) => {
        const response = await apiClient.post(url, data, config);
        return response.data;
    },
    put: async (url, data, config = {}) => {
        const response = await apiClient.put(url, data, config);
        return response.data;
    },
    patch: async (url, data, config = {}) => {
        const response = await apiClient.patch(url, data, config);
        return response.data;
    },
    delete: async (url, config = {}) => {
        const response = await apiClient.delete(url, config);
        return response.data;
    },
};

export default api;
