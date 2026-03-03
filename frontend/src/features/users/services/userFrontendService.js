import api from '@/shared/api_client';

export const userFrontendService = {
    getUsers: async ({ page = 1, is_active, search } = {}) => {
        const params = new URLSearchParams();
        if (page) params.append('page', page);
        if (is_active !== undefined && is_active !== null && is_active !== '') {
            params.append('is_active', is_active);
        }
        if (search) params.append('search', search);

        return await api.get(`users/?${params.toString()}`);
    },

    createUser: async (userData) => {
        return await api.post(`users/`, userData);
    },

    getUserById: async (id) => {
        return await api.get(`users/${id}/`);
    },

    updateUser: async (id, userData) => {
        return await api.patch(`users/${id}/`, userData);
    },

    deleteUser: async (id) => {
        return await api.delete(`users/${id}/`);
    }
};
