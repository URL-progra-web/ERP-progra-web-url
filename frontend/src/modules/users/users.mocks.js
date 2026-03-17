// src/features/users/users.mocks.js

export const usersMocks = {
    users: [
        { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'ADMIN', is_active: true },
        { id: 2, name: 'María López', email: 'maria@example.com', role: 'MANAGER', is_active: true },
        { id: 3, name: 'Carlos Ruiz', email: 'carlos@example.com', role: 'VISITOR', is_active: false },
    ],
    roles: [
        { id: 1, name: 'ADMIN', description: 'Acceso total al sistema' },
        { id: 2, name: 'MANAGER', description: 'Gestión de operaciones' },
        { id: 3, name: 'VISITOR', description: 'Solo lectura y órdenes' },
    ]
};
