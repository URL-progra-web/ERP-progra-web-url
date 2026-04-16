import React from 'react';
import { FiUsers, FiBriefcase } from 'react-icons/fi';

const CustomersPage = React.lazy(() => import('./customers/CustomersPage'));
const EntrepreneursPage = React.lazy(() => import('./entrepreneurs/EntrepreneursPage'));

export const crmFeature = {
    id: 'crm',
    group: 'CRM',
    items: [
        {
            text: 'Clientes',
            path: 'crm/customers',
            icon: FiUsers,
            roles: ['MANAGER', 'ADMIN'],
            element: <CustomersPage />,
        },
        {
            text: 'Emprendedores',
            path: 'crm/entrepreneurs',
            icon: FiBriefcase,
            roles: ['MANAGER', 'ADMIN'],
            element: <EntrepreneursPage />,
        },
    ],
};
