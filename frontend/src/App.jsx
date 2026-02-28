import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './features/users/pages/Login';
import DashboardLayout from './core/layout/DashboardLayout/DashboardLayout';
import PosDashboard from './features/pos/pages/PosDashboard';
import InventoryDashboard from './features/inventory/pages/InventoryDashboard';
import HrDashboard from './features/hr/pages/HrDashboard';

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
          <Route path="hr" element={<HrDashboard />} />
        </Route>

        {/* Redirect unknown routes to login for now */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
