import axios from 'axios';

// VITE_API_URL ya incluye /api, así que solo agregamos /public
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const publicApi = axios.create({
  baseURL: `${API_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const publicService = {
  // Categorías
  getCategories: async () => {
    const response = await publicApi.get('/categories/');
    return response.data;
  },

  // Categorías en árbol jerárquico
  getCategoriesTree: async () => {
    const response = await publicApi.get('/categories/tree/');
    return response.data;
  },

  // Ruta de categoría (para breadcrumb)
  getCategoryPath: async (categoryId) => {
    const response = await publicApi.get(`/categories/${categoryId}/path/`);
    return response.data;
  },

  // Filtros disponibles
  getFilters: async (params = {}) => {
    const response = await publicApi.get('/filters/', { params });
    return response.data;
  },

  // Productos
  getProducts: async (params = {}) => {
    const response = await publicApi.get('/products/', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await publicApi.get(`/products/${id}/`);
    return response.data;
  },

  // Crear pedido
  createOrder: async (orderData) => {
    const response = await publicApi.post('/orders/', orderData);
    return response.data;
  },
};
