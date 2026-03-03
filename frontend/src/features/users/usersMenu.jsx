import { UserCog } from 'lucide-react';

export const usersMenu = [
    {
        to: '/app/users',
        label: 'Gestión de Usuarios',
        icon: UserCog,
        // Require specific roles to see this menu item if you want to filter in the UI
        roles: ['admin', 'staff'],
    },
];
