import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardHome from '../pages/DashboardHome';
import NotFoundPage from '../../misc/pages/NotFoundPage';

/**
 * Manager routes, nested under /dashboard/manager/*
 * Accessible by: ADMIN, MANAGER
 * Add manager-level views here (orders, deliveries, reports, etc.)
 */
const ManagerRoutes = () => (
    <Routes>
        <Route index element={<DashboardHome />} />
        {/* Add manager-specific routes below */}
        {/* <Route path="orders" element={<OrdersList />} /> */}
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default ManagerRoutes;
