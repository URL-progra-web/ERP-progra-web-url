import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: if token is invalid/expired, clear it and go to login
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/users/login/');
        const isAlreadyOnLogin = window.location.pathname === '/login';

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Only redirect if NOT a login attempt and NOT already on the login page
            if (!isLoginRequest && !isAlreadyOnLogin) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
