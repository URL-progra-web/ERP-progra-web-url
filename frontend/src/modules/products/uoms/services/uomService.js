import api from '~/core/api/api';

export const uomService = {
    // UOMs
    getUoms: async ({ page, page_size } = {}) => {
        const params = { page, page_size };
        const response = await api.get('/inventory/uoms/', { params });
        return response.data;
    },

    createUom: async (data) => {
        const response = await api.post('/inventory/uoms/', data);
        return response.data;
    },

    updateUom: async (id, data) => {
        const response = await api.put(`/inventory/uoms/${id}/`, data);
        return response.data;
    },

    deleteUom: async (id) => {
        await api.delete(`/inventory/uoms/${id}/`);
    },

    // UOM Conversions
    getConversions: async ({ from_uom_id, to_uom_id, page, page_size } = {}) => {
        const params = { page, page_size };
        if (from_uom_id) params.from_uom_id = from_uom_id;
        if (to_uom_id) params.to_uom_id = to_uom_id;
        const response = await api.get('/inventory/uom-conversions/', { params });
        return response.data;
    },

    getApplicableConversions: async (baseUomId) => {
        const response = await api.get('/inventory/uom-conversions/', {
            params: { to_uom_id: baseUomId, page_size: 200 },
        });
        return response.data;
    },

    createConversion: async (data) => {
        const response = await api.post('/inventory/uom-conversions/', data);
        return response.data;
    },

    updateConversion: async (id, data) => {
        const response = await api.put(`/inventory/uom-conversions/${id}/`, data);
        return response.data;
    },

    deleteConversion: async (id) => {
        await api.delete(`/inventory/uom-conversions/${id}/`);
    },
};
