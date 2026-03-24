import api from '~/core/api/api';

export const variantService = {
    getVariants: async ({ search, is_active, in_stock, product, business_unit, page, page_size } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (is_active !== undefined && is_active !== '') params.is_active = is_active;
        if (in_stock !== undefined && in_stock !== '') params.in_stock = in_stock;
        if (product !== undefined && product !== '') params.product = product;
        if (business_unit !== undefined && business_unit !== '') params.business_unit = business_unit;
        if (page !== undefined && page !== '') params.page = page;
        if (page_size !== undefined && page_size !== '') params.page_size = page_size;

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