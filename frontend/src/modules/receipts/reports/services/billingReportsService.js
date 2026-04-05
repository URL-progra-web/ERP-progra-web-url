import api from '~/core/api/api';

const BASE_URL = '/receipts/reports/';

const buildParams = ({ date_after, date_before, user_id, entrepreneur_id } = {}) => {
    const params = {};
    if (date_after) params.date_after = date_after;
    if (date_before) params.date_before = date_before;
    if (user_id) params.user_id = user_id;
    if (entrepreneur_id) params.entrepreneur_id = entrepreneur_id;
    return params;
};

export const billingReportsService = {
    async summary(filters = {}) {
        const response = await api.get(`${BASE_URL}summary/`, { params: buildParams(filters) });
        return response.data;
    },

    async byDay(filters = {}) {
        const response = await api.get(`${BASE_URL}by-day/`, { params: buildParams(filters) });
        return response.data;
    },

    async byMonth(filters = {}) {
        const response = await api.get(`${BASE_URL}by-month/`, { params: buildParams(filters) });
        return response.data;
    },

    async byCustomer(filters = {}) {
        const response = await api.get(`${BASE_URL}by-customer/`, { params: buildParams(filters) });
        return response.data;
    },

    async byUser(filters = {}) {
        const response = await api.get(`${BASE_URL}by-user/`, { params: buildParams(filters) });
        return response.data;
    },

    async byEntrepreneur(filters = {}) {
        const response = await api.get(`${BASE_URL}by-entrepreneur/`, { params: buildParams(filters) });
        return response.data;
    },
};
