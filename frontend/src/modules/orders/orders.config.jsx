import React from 'react';
import { FiCreditCard, FiLayers, FiShoppingCart } from 'react-icons/fi';
import PaymentMethodsPage from './paymentMethods/PaymentMethodsPage';
import OrderStatusesPage from './orderStatuses/OrderStatusesPage';
import OrdersPage from './orders/OrdersPage';
import OrderDetailPage from './orders/OrderDetailPage';
import OrderCreatePage from './orders/OrderCreatePage';

export const ordersFeature = {
    id: 'orders',
    group: 'Pedidos',
    items: [
        {
            text: 'Pedidos',
            path: 'orders/list',
            icon: FiShoppingCart,
            roles: ['MANAGER', 'ADMIN'],
            element: <OrdersPage />,
        },
        {
            text: 'Detalle Pedido',
            path: 'orders/detail/:orderId',
            icon: FiShoppingCart,
            roles: ['MANAGER', 'ADMIN'],
            element: <OrderDetailPage />,
            hidden: true,
        },
        {
            text: 'Crear Pedido',
            path: 'orders/create',
            icon: FiShoppingCart,
            roles: ['MANAGER', 'ADMIN'],
            element: <OrderCreatePage />,
            hidden: true,
        },
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
