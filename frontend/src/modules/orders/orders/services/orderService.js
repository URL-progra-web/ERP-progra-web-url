import api from '~/core/api/api';

const BASE_URL = '/orders/';

export const orderService = {
    async list({ search } = {}) {
        const params = {};
        if (search) params.search = search;
        const response = await api.get(BASE_URL, { params });
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
};
