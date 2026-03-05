import axios from 'axios';
import { API_URL } from '@/core/config';

/**
 * Instancia de Axios con manejo inteligente de tokens.
 * 
 * Características:
 * - withCredentials: true para cookies HttpOnly
 * - Interceptor que detecta 401 y hace refresh automático
 * - Cola de peticiones pendientes durante el refresh
 * - Evita bucles infinitos en rutas de auth
 */

export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =============================================================================
// Estado del interceptor de refresh
// =============================================================================
let isRefreshing = false;
let failedQueue = [];

/**
 * Procesa la cola de peticiones pendientes después del refresh.
 * @param {Error|null} error - Si hay error, rechaza todas las peticiones
 */
const processQueue = (error) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

/**
 * Rutas que NO deben triggear el refresh automático (evita bucles infinitos)
 */
const AUTH_ROUTES = [
    '/users/auth/login/',
    '/users/auth/refresh/',
    '/users/auth/logout/',
    '/users/auth/me/', 
];

const isAuthRoute = (url) => {
    return AUTH_ROUTES.some(route => url?.includes(route));
};

// =============================================================================
// Request Interceptor
// =============================================================================
apiClient.interceptors.request.use(
    (config) => {
        // Las cookies se envían automáticamente con withCredentials: true
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// =============================================================================
// Response Interceptor - Manejo inteligente de 401
// =============================================================================
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Si no es 401 o ya se reintentó, rechazar inmediatamente
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // Evitar bucles: no hacer refresh si el 401 viene de rutas de auth
        if (isAuthRoute(originalRequest.url)) {
            return Promise.reject(error);
        }

        // Si ya estamos refrescando, encolar esta petición
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => {
                    // Después del refresh exitoso, reintentar
                    return apiClient(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        // Marcar que estamos refrescando y que esta petición ya se reintentó
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Intentar refresh - el backend lee el refresh_token de la cookie
            await apiClient.post('/users/auth/refresh/');

            // Refresh exitoso - procesar cola de peticiones pendientes
            processQueue(null);

            // Reintentar la petición original
            return apiClient(originalRequest);

        } catch (refreshError) {
            // Refresh falló - rechazar todas las peticiones encoladas
            processQueue(refreshError);

            // Redirigir a login solo si no estamos ya en /login
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }

            return Promise.reject(refreshError);

        } finally {
            isRefreshing = false;
        }
    }
);

// =============================================================================
// API Helper Methods
// =============================================================================
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
