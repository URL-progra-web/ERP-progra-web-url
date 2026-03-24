import api from '~/core/api/api';

export const productService = {
    getProducts: async ({ search, category, entrepreneur, business_unit } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (entrepreneur) params.entrepreneur = entrepreneur;
        if (business_unit) params.business_unit = business_unit;
        const response = await api.get('/products/products/', { params });
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/products/products/${id}/`);
        return response.data;
    },

    createProduct: async (data) => {
        const response = await api.post('/products/products/', data);
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`/products/products/${id}/`, data);
        return response.data;
    },

    deleteProduct: async (id) => {
        const response = await api.delete(`/products/products/${id}/`);
        return response.data;
    },

    getEntrepreneurs: async () => {
        const response = await api.get('/crm/entrepreneurs/');
        return response.data;
    },

    getBusinessUnits: async () => {
        const response = await api.get('/inventory/business-units/');
        return response.data;
    },
};
