import api from '~/core/api/api';

const BASE_URL = '/orders/items/';

export const orderItemsService = {
    async list({ order_id } = {}) {
        const params = {};
        if (order_id) params.order_id = order_id;
        const response = await api.get(BASE_URL, { params });
        return response.data;
    },

    async create(payload) {
        const response = await api.post(BASE_URL, payload);
        return response.data;
    },

    async bulkCreate(payload) {
        const response = await api.post(`${BASE_URL}bulk/`, payload);
        return response.data;
    },

    async get(id) {
        const response = await api.get(`${BASE_URL}${id}/`);
        return response.data;
    },

    async update(id, payload) {
        const response = await api.patch(`${BASE_URL}${id}/`, payload);
        return response.data;
    },

    async remove(id) {
        await api.delete(`${BASE_URL}${id}/`);
    },
};
