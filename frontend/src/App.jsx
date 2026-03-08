import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from '~users/context/AuthContext';
import ProtectedRoute from '~shared/components/auth/ProtectedRoute';
import Login from '~users/pages/Login';
import DashboardLayout from '~core/layout/DashboardLayout/DashboardLayout';
import PosDashboard from '~pos/pages/PosDashboard';
import HrDashboard from '~hr/pages/HrDashboard';
import Spinner from '~shared/components/Spinner';

// Paginas con Lazy Loading (Mejora de Rendimiento)
const InventoryRoutes = React.lazy(() => import('~inventory/InventoryRoutes'));
const UsersDashboard = React.lazy(() => import('~users/pages/UsersDashboard'));

// Componente para escuchar expiración de sesión (Evita Hard Reload)
function AuthListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthExpired = () => {
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthListener />
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        }>
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
              <Route path="inventory/*" element={<InventoryRoutes />} />
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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
