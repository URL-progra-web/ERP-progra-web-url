import React from 'react';
import { FiCreditCard, FiLayers } from 'react-icons/fi';
import PaymentMethodsPage from './paymentMethods/PaymentMethodsPage';
import OrderStatusesPage from './orderStatuses/OrderStatusesPage';

export const ordersFeature = {
    id: 'orders',
    group: 'Pedidos',
    items: [
        {
            text: 'Métodos de Pago',
            path: 'orders/payment-methods',
            icon: FiCreditCard,
            roles: ['MANAGER', 'ADMIN'],
            element: <PaymentMethodsPage />,
        },
        {
            text: 'Estados & Flujo',
            path: 'orders/statuses',
            icon: FiLayers,
            roles: ['MANAGER', 'ADMIN'],
            element: <OrderStatusesPage />,
        },
    ],
};
