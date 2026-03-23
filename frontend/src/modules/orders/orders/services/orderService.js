import api from '~/core/api/api';

const BASE_URL = '/orders/';

export const orderService = {
    async list({ search, page, page_size } = {}) {
        const params = {};
        if (search) params.search = search;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get(BASE_URL, { params });
        return response.data;
    },

    async get(id) {
        const response = await api.get(`${BASE_URL}${id}/`);
        return response.data;
    },

    async catalogs() {
        const response = await api.get(`${BASE_URL}catalogs/`);
        return response.data;
    },

    async create(payload) {
        const response = await api.post(BASE_URL, payload);
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
