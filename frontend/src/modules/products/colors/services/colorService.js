import api from '~/core/api/api';

export const colorService = {
    getColors: async ({ search } = {}) => {
        const params = {};
        if (search) params.search = search;

        const response = await api.get('/products/colors/', { params });
        return response.data;
    },

    getColor: async (id) => {
        const response = await api.get(`/products/colors/${id}/`);
        return response.data;
    },

    createColor: async (data) => {
        const response = await api.post('/products/colors/', data);
        return response.data;
    },

    updateColor: async (id, data) => {
        const response = await api.put(`/products/colors/${id}/`, data);
        return response.data;
    },

    deleteColor: async (id) => {
        const response = await api.delete(`/products/colors/${id}/`);
        return response.data;
    },
};