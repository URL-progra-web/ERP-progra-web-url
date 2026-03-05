import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/shared/api_client';

/**
 * Contexto de autenticación con Cookies HttpOnly.
 * 
 * Maneja:
 * - Estado global del usuario autenticado
 * - Login/Logout con cookies
 * - Verificación automática de sesión al cargar la app
 */

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Obtiene los datos del usuario actual desde /auth/me/
     */
    const fetchCurrentUser = useCallback(async () => {
        try {
            const response = await apiClient.get('/users/auth/me/');
            setUser(response.data);
            setIsAuthenticated(true);
            setError(null);
            return response.data;
        } catch (err) {
            setUser(null);
            setIsAuthenticated(false);
            throw err;
        }
    }, []);

    /**
     * Login: envía credenciales, obtiene cookies, y carga datos del usuario
     */
    const login = useCallback(async (credentials) => {
        setIsLoading(true);
        setError(null);

        try {
            // 1. Llamar a /auth/login/ - setea las cookies HttpOnly
            await apiClient.post('/users/auth/login/', credentials);

            // 2. Obtener datos del usuario desde /auth/me/
            await fetchCurrentUser();
        } catch (err) {
            const errorMessage = err.response?.data?.detail || 'Error al iniciar sesión';
            setError(errorMessage);
            setUser(null);
            setIsAuthenticated(false);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [fetchCurrentUser]);

    /**
     * Logout: invalida tokens en backend y limpia estado
     */
    const logout = useCallback(async () => {
        setIsLoading(true);

        try {
            // Llamar al backend para invalidar el refresh token
            await apiClient.post('/users/auth/logout/');
        } catch (err) {
            // Ignorar errores de logout (puede fallar si ya expiró)
            console.warn('Logout error:', err);
        } finally {
            // Siempre limpiar el estado local
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
            setIsLoading(false);
        }
    }, []);

    /**
     * Verifica si hay una sesión activa al cargar la app.
     * Llama a /auth/me/ para comprobar si las cookies son válidas.
     */
    const checkAuth = useCallback(async () => {
        setIsLoading(true);

        try {
            await fetchCurrentUser();
        } catch (err) {
            // No hay sesión activa - esto es normal, no es un error
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, [fetchCurrentUser]);

    // Verificar autenticación al montar el componente
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const value = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}

export default AuthContext;
