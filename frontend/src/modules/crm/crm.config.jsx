import React from 'react';
import { FiUsers } from 'react-icons/fi';
import CustomersPage from './customers/CustomersPage';

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
    ],
};
