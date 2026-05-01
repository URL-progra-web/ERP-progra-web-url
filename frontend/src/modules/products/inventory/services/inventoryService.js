import api from '~/core/api/api';

export const inventoryService = {
    getProducts: async ({ search, category, page, page_size } = {}) => {
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get('/products/products/', { params });
        return response.data;
    },

    getTransactionTypes: async ({ page, page_size } = {}) => {
        const params = {};
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get('/inventory/transaction-types/', { params });
        return response.data;
    },

    getTransactionType: async (name) => {
        const response = await api.get(`/inventory/transaction-types/${name}/`);
        return response.data;
    },

    createTransactionType: async (data) => {
        const response = await api.post('/inventory/transaction-types/', data);
        return response.data;
    },

    updateTransactionType: async (name, data) => {
        const response = await api.patch(`/inventory/transaction-types/${name}/`, data);
        return response.data;
    },

    deleteTransactionType: async (name) => {
        const response = await api.delete(`/inventory/transaction-types/${name}/`);
        return response.data;
    },

    getTransactions: async ({ variant_id, transaction_type, date_from, date_to, page, page_size } = {}) => {
        const params = {};
        if (variant_id) params.variant_id = variant_id;
        if (transaction_type) params.transaction_type = transaction_type;
        if (date_from) params.date_from = date_from;
        if (date_to) params.date_to = date_to;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get('/inventory/transactions/', { params });
        return response.data;
    },

    exportExcel: async ({ variant_id, transaction_type, date_from, date_to } = {}) => {
        const params = {};
        if (variant_id) params.variant_id = variant_id;
        if (transaction_type) params.transaction_type = transaction_type;
        if (date_from) params.date_from = date_from;
        if (date_to) params.date_to = date_to;
        const response = await api.get('/inventory/transactions/export/excel/', {
            params,
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'transacciones.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    createTransaction: async (data) => {
        const payload = {
            variant_id: data.variant_id,
            transaction_type_name: data.transaction_type_name,
            quantity: data.quantity,
            selected_uom_id: data.selected_uom_id,
            reference: data.reference || null,
            notes: data.notes || null,
        };
        const response = await api.post('/inventory/transactions/', payload);
        return response.data;
    },

    getVariants: async (productId = null) => {
        const params = {};
        if (productId) params.product = productId;
        const response = await api.get('/products/variants/', { params });
        return response.data;
    },

    getProduct: async (productId) => {
        const response = await api.get(`/products/products/${productId}/`);
        return response.data;
    },

    getStock: async (variantId) => {
        const response = await api.get(`/inventory/stock/?variant=${variantId}`);
        return response.data;
    },
};
