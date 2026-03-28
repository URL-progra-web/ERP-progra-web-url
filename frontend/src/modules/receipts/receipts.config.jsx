import React from 'react';
import { FiFileText } from 'react-icons/fi';
import ReceiptsPage from './receipt/pages/ReceiptsPage';
import ReceiptDetailPage from './receipt/pages/ReceiptDetailPage';

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
        {
            text: 'Detalle Recibo',
            path: 'receipts/detail/:receiptId',
            icon: FiFileText,
            roles: ['MANAGER', 'ADMIN'],
            element: <ReceiptDetailPage />,
            hidden: true,
        },
    ],
};