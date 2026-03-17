import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardHome from '../pages/DashboardHome';
import UsersList from '../../users/pages/UsersList';
import NotFoundPage from '../../misc/pages/NotFoundPage';

/**
 * Admin-only routes, nested under /dashboard/admin/*
 * Add new admin views here. Accessible by: ADMIN
 */
const AdminRoutes = () => (
    <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UsersList />} />
        {/* Add admin-specific routes below */}
        {/* <Route path="settings" element={<Settings />} /> */}
        <Route path="*" element={<NotFoundPage />} />
    </Routes>
);

export default AdminRoutes;
