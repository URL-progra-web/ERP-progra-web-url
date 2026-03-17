import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardHome from '../pages/DashboardHome';
import NotFoundPage from '../../misc/pages/NotFoundPage';

/**
 * Visitor routes, nested under /dashboard/visitor/*
 * Accessible by: ADMIN, MANAGER, VISITOR
 * Read-only views: catalog, order tracking, etc.
 */
const VisitorRoutes = () => (
    <Routes>
        <Route index element={<DashboardHome />} />
        {/* <Route path="catalog" element={<Catalog />} /> */}
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default VisitorRoutes;
