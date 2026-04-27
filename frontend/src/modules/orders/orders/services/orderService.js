import api from '~/core/api/api';

const BASE_URL = '/orders/';
const NOTIFICATIONS_URL = '/orders/notifications/';

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

    async exportExcel({ date_from, date_to } = {}) {
        const params = {};
        if (date_from) params.date_from = date_from;
        if (date_to)   params.date_to   = date_to;
        const response = await api.get(`${BASE_URL}export/excel/`, {
            params,
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pedidos.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    async listNotifications({ page, page_size } = {}) {
        const params = {};
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get(NOTIFICATIONS_URL, { params });
        return response.data;
    },
};
