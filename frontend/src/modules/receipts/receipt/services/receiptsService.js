import api from '~/core/api/api';

const BASE_URL = '/receipts/';

export const receiptsService = {
    async list({ page, page_size, issued_at_after, issued_at_before,client } = {}) {
        const params = {};
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        if (issued_at_after) params.issued_at_after = issued_at_after;
        if (issued_at_before) params.issued_at_before = issued_at_before;
        if (client) params.client = client;
        const response = await api.get(BASE_URL, { params });
        return response.data;
    },

    // Metodos pedidos: list, getById, create y update, apuntando al endpoint
    async getById(id) {
        const response = await api.get(`${BASE_URL}${id}/`);
        return response.data;
    },

    async create(payload) {
        const response = await api.post(BASE_URL, payload);
        return response.data;
    },

    async update(id, payload) {
        const response = await api.put(`${BASE_URL}${id}/`, payload);
        return response.data;
    },
};