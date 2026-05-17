import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '~/core/auth/AuthContext';
import { ThemeProvider } from '~/core/theme/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Added for dropdowns/modals
import './index.css';

const ProtectedRoute = lazy(() => import('~/core/auth/ProtectedRoute'));
const DashboardLayout = lazy(() => import('~/core/layouts/DashboardLayout'));
const Login = lazy(() => import('~/modules/Auth/pages/Login'));
const DynamicRoutes = lazy(() => import('~/core/registry/DynamicRoutes'));
const ForbiddenPage = lazy(() => import('~/modules/misc/pages/ForbiddenPage'));
const NotFoundPage = lazy(() => import('~/modules/misc/pages/NotFoundPage'));
const PublicLayout = lazy(() => import('~/modules/public/layouts/PublicLayout').then((module) => ({ default: module.PublicLayout })));
const CatalogPage = lazy(() => import('~/modules/public/pages/CatalogPage').then((module) => ({ default: module.CatalogPage })));
const ProductDetailPage = lazy(() => import('~/modules/public/pages/ProductDetailPage').then((module) => ({ default: module.ProductDetailPage })));
const CheckoutPage = lazy(() => import('~/modules/public/pages/CheckoutPage').then((module) => ({ default: module.CheckoutPage })));

const RouteLoader = () => (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-body text-body">
        <div className="d-flex flex-column align-items-center gap-3">
            <div
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '2px solid rgba(var(--bs-primary-rgb), 0.2)',
                    borderTopColor: 'var(--bs-primary)',
                    animation: 'spinnerRotate 0.8s linear infinite',
                }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--bs-secondary-color)' }}>
                Cargando modulo...
            </span>
        </div>
    </div>
);

/**
 * App.jsx — Top-level routing only.
 */
function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Suspense fallback={<RouteLoader />}> 
                        <Routes>
                            {/* Public Store */}
                            <Route path="/tienda" element={<PublicLayout />}>
                                <Route index element={<CatalogPage />} />
                                <Route path="producto/:id" element={<ProductDetailPage />} />
                                <Route path="checkout" element={<CheckoutPage />} />
                            </Route>

                            {/* Auth */}
                            <Route path="/login" element={<Login />} />

                            {/* Roles protected routes... */}
                            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                                <Route path="/dashboard/admin" element={<DashboardLayout />}>
                                    <Route path="*" element={<DynamicRoutes role="ADMIN" />} />
                                </Route>
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']} />}>
                                <Route path="/dashboard/manager" element={<DashboardLayout />}>
                                    <Route path="*" element={<DynamicRoutes role="MANAGER" />} />
                                </Route>
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'VISITOR']} />}>
                                <Route path="/dashboard/visitor" element={<DashboardLayout />}>
                                    <Route path="*" element={<DynamicRoutes role="VISITOR" />} />
                                </Route>
                            </Route>

                            {/* Static Error Routes */}
                            <Route path="/forbidden" element={<ForbiddenPage />} />
                            <Route path="/404" element={<NotFoundPage />} />

                            {/* Root: redirect to login */}
                            <Route path="/" element={<Navigate to="/login" replace />} />
                            <Route path="*" element={<Navigate to="/404" replace />} />
                        </Routes>
                    </Suspense>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
