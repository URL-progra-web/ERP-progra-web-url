import React from 'react';
import { FiUsers } from 'react-icons/fi';

const UsersList = React.lazy(() => import('./pages/UsersList'));

/**
 * Cada módulo exporta esta configuración:
 * - group: En qué sección del sidebar aparece
 * - items: Las páginas que contiene, con su ruta, icono y quién puede verla.
 */
export const usersFeature = {
    id: 'users',
    group: 'Administración',
    items: [
        {
            text: 'Usuarios & Roles',
            path: 'users', // Se concatena al dashboard del rol (ej: /dashboard/admin/users)
            icon: FiUsers,
            roles: ['ADMIN'], // Quién tiene permiso
            element: <UsersList />
        }
    ]
};
