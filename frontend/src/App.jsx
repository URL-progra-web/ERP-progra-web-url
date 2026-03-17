import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { ThemeProvider } from './core/theme/ThemeContext';
import ProtectedRoute from './core/auth/ProtectedRoute';
import DashboardLayout from './core/layouts/DashboardLayout';
import Login from './modules/Auth/pages/Login';
import DynamicRoutes from './core/registry/DynamicRoutes';
import ForbiddenPage from './modules/misc/pages/ForbiddenPage';
import NotFoundPage from './modules/misc/pages/NotFoundPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Added for dropdowns/modals

/**
 * App.jsx — Top-level routing only.
 */
function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
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
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
