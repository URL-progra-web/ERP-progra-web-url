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

    async statsDailyOrders({ date_from, date_to, statuses } = {}) {
        const params = {};
        if (date_from) params.date_from = date_from;
        if (date_to)   params.date_to   = date_to;
        if (statuses && statuses.length) params.statuses = statuses.join(',');
        const response = await api.get(`${BASE_URL}stats/daily/`, { params });
        return response.data; // { statuses: [...], series: [{date, STATUS: count, ...}] }
    },

    async statsCumulativeOrders({ date_from, date_to, statuses } = {}) {
        const params = {};
        if (date_from) params.date_from = date_from;
        if (date_to)   params.date_to   = date_to;
        if (statuses && statuses.length) params.statuses = statuses.join(',');
        const response = await api.get(`${BASE_URL}stats/cumulative/`, { params });
        return response.data; // { statuses: [...], series: [{date, STATUS: running_total, ...}] }
    },
};
