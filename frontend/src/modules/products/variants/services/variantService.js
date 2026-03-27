import api from '~/core/api/api';

export const variantService = {
    getVariants: async ({ search, is_active, in_stock, product, entrepreneur, business_unit, order_id, color, size, uom, page, page_size } = {}) => {
        const params = {};
        const appendParam = (key, value) => {
            if (value !== undefined && value !== null && value !== '') {
                params[key] = value;
            }
        };

        appendParam('search', search);
        appendParam('is_active', is_active);
        appendParam('in_stock', in_stock);
        appendParam('product', product);
        appendParam('entrepreneur', entrepreneur);
        appendParam('business_unit', business_unit);
        appendParam('order_id', order_id);
        appendParam('color', color);
        appendParam('size', size);
        appendParam('uom', uom);
        appendParam('page', page);
        appendParam('page_size', page_size);

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

    getEntrepreneurs: async () => {
        const response = await api.get('/crm/entrepreneurs/');
        return response.data;
    },

    getBusinessUnits: async () => {
        const response = await api.get('/inventory/business-units/');
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
