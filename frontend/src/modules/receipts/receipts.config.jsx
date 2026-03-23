import React from 'react';
import { FiFileText } from 'react-icons/fi';
import ReceiptsPage from './receipt/pages/ReceiptsPage';

export const receiptsFeature = {
    id: 'receipts',
    group: 'Facturación',
    items: [
        {
            text: 'Recibos',
            path: 'receipts',
            icon: FiFileText,
            roles: ['MANAGER', 'ADMIN'],
            element: <ReceiptsPage />,
        },
    ],
};