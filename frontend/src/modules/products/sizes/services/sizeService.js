import api from '~/core/api/api';

export const sizeService = {
    getSizes: async ({ search } = {}) => {
        const params = {};
        if (search) params.search = search;

        const response = await api.get('/products/sizes/', { params });
        return response.data;
    },

    getSize: async (id) => {
        const response = await api.get(`/products/sizes/${id}/`);
        return response.data;
    },

    createSize: async (data) => {
        const response = await api.post('/products/sizes/', data);
        return response.data;
    },

    updateSize: async (id, data) => {
        const response = await api.put(`/products/sizes/${id}/`, data);
        return response.data;
    },

    deleteSize: async (id) => {
        const response = await api.delete(`/products/sizes/${id}/`);
        return response.data;
    },
};