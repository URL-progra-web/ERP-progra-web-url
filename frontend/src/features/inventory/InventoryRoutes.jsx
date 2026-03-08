import React from 'react';
import { Routes, Route } from 'react-router-dom';

const InventoryDashboard = React.lazy(() => import('./pages/InventoryDashboard'));
const WarehousesPage = React.lazy(() => import('./warehouses/WarehousesPage'));

export default function InventoryRoutes() {
  return (
    <Routes>
      <Route path="/" element={<InventoryDashboard />} />
      <Route path="warehouses" element={<WarehousesPage />} />
    </Routes>
  );
}
