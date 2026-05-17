import { createContext, useState, use, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setLoading(false);
            return;
        }
        // Validate token against backend - this also detects blocked users
        api.get('/users/users/me/')
            .then(res => {
                setUser(res.data);
                localStorage.setItem('user:v1', JSON.stringify(res.data));
            })
            .catch(() => {
                // Token invalid, expired, or user blocked - clear everything
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user:v1');
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/users/login/', { email, password });
        const { access, refresh, user: userData } = response.data;
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        localStorage.setItem('user:v1', JSON.stringify(userData));
        
        setUser(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user:v1');
        setUser(null);
    };

    const hasRole = (roles) => {
        if (!user || !user.role) return false;
        return roles.includes(user.role.name);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => use(AuthContext);
