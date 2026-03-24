import api from '~/core/api/api';

export const variantService = {
    getVariants: async ({ search, is_active } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (is_active !== undefined && is_active !== '') params.is_active = is_active;

        const response = await api.get('/products/variants/', { params });
        return response.data;
    },

    getVariant: async (id) => {
        const response = await api.get(`/products/variants/${id}/`);
        return response.data;
    },

    createVariant: async (data) => {
        const response = await api.post('/products/variants/', data);
        return response.data;
    },

    updateVariant: async (id, data) => {
        const response = await api.put(`/products/variants/${id}/`, data);
        return response.data;
    },

    deleteVariant: async (id) => {
        const response = await api.delete(`/products/variants/${id}/`);
        return response.data;
    },

    getProducts: async () => {
        const response = await api.get('/products/products/');
        return response.data;
    },

    getColors: async () => {
        const response = await api.get('/products/colors/');
        return response.data;
    },

    getSizes: async () => {
        const response = await api.get('/products/sizes/');
        return response.data;
    },

    getUoms: async () => {
        const response = await api.get('/inventory/uoms/');
        return response.data;
    },
};