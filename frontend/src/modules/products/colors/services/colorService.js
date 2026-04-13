import api from '~/core/api/api';

export const colorService = {
    getColors: async ({ search, page, page_size } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;

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
