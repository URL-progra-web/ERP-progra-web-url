import React from 'react';
import { FiUsers, FiBriefcase } from 'react-icons/fi';
import CustomersPage from './customers/CustomersPage';
import EntrepreneursPage from './entrepreneurs/EntrepreneursPage';

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
