import axios from 'axios';
import { API_URL } from '@/core/config';

export const authService = {
    login: async (email, password) => {
        const response = await axios.post(`${API_URL}/token/`, {
            email,
            password
        });

        if (response.data.access) {
            localStorage.setItem('token', response.data.access);
        }

        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};
