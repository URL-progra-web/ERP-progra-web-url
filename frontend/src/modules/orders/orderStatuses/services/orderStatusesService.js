import api from '~/core/api/api';

const BASE_URL = '/orders/statuses/';

export const orderStatusesService = {
    async list({ search } = {}) {
        const params = {};
        if (search) params.search = search;
        params.page_size = 50;
        const response = await api.get(BASE_URL, { params });
        return response.data;
    },

    async workflow() {
        const response = await api.get(`${BASE_URL}transitions/`);
        return response.data;
    },

    async transition(payload) {
        const response = await api.post(`${BASE_URL}transition/`, payload);
        return response.data;
    },
};
