import api from '../../../core/api/api';

export const userService = {
    getUsers: async ({ search, role_id, is_active, page = 1, page_size = 20 } = {}) => {
        const params = { page, page_size };
        if (search) params.search = search;
        if (role_id) params.role_id = role_id;
        if (is_active !== undefined && is_active !== '') params.is_active = is_active;
        const response = await api.get('/users/users/', { params });
        return response.data;
    },
    
    getRoles: async () => {
        const response = await api.get('/users/roles/');
        return response.data;
    },
    
    createUser: async (userData) => {
        const response = await api.post('/users/users/', userData);
        return response.data;
    },
    
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/users/${id}/`, userData);
        return response.data;
    },
    
    toggleActiveStatus: async (id) => {
        const response = await api.patch(`/users/users/${id}/toggle_active/`);
        return response.data;
    }
};
