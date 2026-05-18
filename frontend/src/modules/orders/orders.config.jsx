import React from 'react';
import { FiBarChart2, FiCreditCard, FiLayers, FiShoppingCart } from 'react-icons/fi';

const PaymentMethodsPage = React.lazy(() => import('./paymentMethods/PaymentMethodsPage'));
const OrderStatusesPage = React.lazy(() => import('./orderStatuses/OrderStatusesPage'));
const OrdersPage = React.lazy(() => import('./orders/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./orders/OrderDetailPage'));
const OrderCreatePage = React.lazy(() => import('./orders/OrderCreatePage'));
const OrdersChartPage = React.lazy(() => import('./orders/OrdersChartPage'));
const OrdersReport = React.lazy(() => import('./ordersReport'));

export const ordersFeature = {
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
        {
            text: 'Estadísticas',
            path: 'orders/chart',
            icon: FiBarChart2,
            roles: ['MANAGER', 'ADMIN'],
            element: <OrdersChartPage />,
        },

        {
            text: 'Reporte de Pedidos',
            path: 'orders/report',
            icon: FiBarChart2,
            roles: ['MANAGER', 'ADMIN'],
            element: <OrdersReport />,
        },
    ],
};
