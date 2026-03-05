import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '~users/context/AuthContext';
import ProtectedRoute from '~shared/components/auth/ProtectedRoute';
import Login from '~users/pages/Login';
import DashboardLayout from '~core/layout/DashboardLayout/DashboardLayout';
import PosDashboard from '~pos/pages/PosDashboard';
import InventoryDashboard from '~inventory/pages/InventoryDashboard';
import HrDashboard from '~hr/pages/HrDashboard';
import UsersDashboard from '~users/pages/UsersDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Private Routes (Protected by Auth Guard) */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="pos" element={<PosDashboard />} />
            <Route path="inventory" element={<InventoryDashboard />} />
            <Route path="hr" element={<HrDashboard />} />
            {/* Users management - requires admin */}
            <Route
              path="users"
              element={
                <ProtectedRoute requireAdmin>
                  <UsersDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Redirect root to app */}
          <Route path="/" element={<Navigate to="/app/pos" replace />} />
          
          {/* Redirect unknown routes to app */}
          <Route path="*" element={<Navigate to="/app/pos" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
