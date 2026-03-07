import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '~users/pages/Login';
import DashboardLayout from '~core/layout/DashboardLayout/DashboardLayout';
import PosDashboard from '~pos/pages/PosDashboard';
import InventoryDashboard from '~inventory/pages/InventoryDashboard';
import HrDashboard from '~hr/pages/HrDashboard';
import UsersDashboard from '~users/pages/UsersDashboard';
import WarehousesPage from "./features/inventory/warehouses/WarehousesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Private Routes (Wrapped in Dashboard Layout) */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route path="pos" element={<PosDashboard />} />
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="inventory/warehouses" element={<WarehousesPage />} />
          <Route path="hr" element={<HrDashboard />} />
          <Route path="users" element={<UsersDashboard />} />
        </Route>

        {/* Redirect unknown routes to login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
