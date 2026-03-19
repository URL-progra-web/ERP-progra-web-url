import api from '~/core/api/api';

const BASE_URL = '/orders/payment-methods/';

export const paymentMethodsService = {
    async list({ search, is_active, page, page_size } = {}) {
        const params = {};
        if (search) params.search = search;
        if (typeof is_active === 'boolean') params.is_active = is_active;
        if (page) params.page = page;
        if (page_size) params.page_size = page_size;
        const response = await api.get(BASE_URL, { params });
        return response.data;
    },

    async updateState(id, payload) {
        const response = await api.patch(`${BASE_URL}${id}/`, payload);
        return response.data;
    },
};
