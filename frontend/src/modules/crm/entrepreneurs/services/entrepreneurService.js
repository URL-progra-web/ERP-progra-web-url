import api from '~/core/api/api';

const BASE_URL = '/crm/entrepreneurs/';

export const entrepreneurService = {
    async list({ search, created_from, created_to, page, page_size } = {}) {
        const params = {};
        if (search) params.search = search;
        if (created_from) params.created_from = created_from;
        if (created_to) params.created_to = created_to;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get(BASE_URL, { params });
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

    async remove(id) {
        await api.delete(`${BASE_URL}${id}/`);
    },

    async getUsers() {
        const response = await api.get(`${BASE_URL}users/`);
        return response.data;
    },
};
