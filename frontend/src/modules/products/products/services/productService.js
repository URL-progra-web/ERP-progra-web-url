import api from '~/core/api/api';

const buildProductPayload = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined) return;

        if (key === 'image') {
            if (value instanceof File) {
                formData.append(key, value);
            }
            return;
        }

        if (value === null) {
            formData.append(key, '');
            return;
        }

        if (typeof value === 'boolean') {
            formData.append(key, value ? 'true' : 'false');
            return;
        }

        formData.append(key, value);
    });

    return formData;
};

export const productService = {
    getProducts: async ({ search, category, entrepreneur, business_unit, base_uom, page, page_size } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (entrepreneur) params.entrepreneur = entrepreneur;
        if (business_unit) params.business_unit = business_unit;
        if (base_uom) params.base_uom = base_uom;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get('/products/products/', { params });
        return response.data;
    },

    getProduct: async (id) => {
        const response = await api.get(`/products/products/${id}/`);
        return response.data;
    },

    createProduct: async (data) => {
        const response = await api.post('/products/products/', buildProductPayload(data));
        return response.data;
    },

    updateProduct: async (id, data) => {
        const response = await api.put(`/products/products/${id}/`, buildProductPayload(data));
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

    getUoms: async () => {
        const response = await api.get('/inventory/uoms/');
        return response.data;
    },
};
