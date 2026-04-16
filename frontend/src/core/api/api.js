import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const resolvedBaseUrl = (() => {
    if (apiUrl) return apiUrl;
    if (!apiBaseUrl) return 'http://localhost:8000/api';

    const normalized = apiBaseUrl.replace(/\/$/, '');
    return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
})();

const api = axios.create({
    baseURL: resolvedBaseUrl,
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
