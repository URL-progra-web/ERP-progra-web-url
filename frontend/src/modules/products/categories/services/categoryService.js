import api from '~/core/api/api';

export const categoryService = {
    getCategories: async ({ search, parent, is_leaf } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (parent) params.parent = parent;
        if (is_leaf !== undefined && is_leaf !== '') params.is_leaf = is_leaf;
        const response = await api.get('/products/categories/', { params });
        return response.data;
    },

    getCategory: async (id) => {
        const response = await api.get(`/products/categories/${id}/`);
        return response.data;
    },

    createCategory: async (data) => {
        const response = await api.post('/products/categories/', data);
        return response.data;
    },

    updateCategory: async (id, data) => {
        const response = await api.put(`/products/categories/${id}/`, data);
        return response.data;
    },

    deleteCategory: async (id) => {
        const response = await api.delete(`/products/categories/${id}/`);
        return response.data;
    },
};
