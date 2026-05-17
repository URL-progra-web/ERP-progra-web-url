import React, { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { getRoutesByRole } from './registryUtils';

const OverviewHome = lazy(() => import('../../modules/Overview/pages/OverviewHome'));
const NotFoundPage = lazy(() => import('../../modules/misc/pages/NotFoundPage'));

const NestedRouteLoader = () => (
    <div className="d-flex align-items-center justify-content-center py-5">
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
                Cargando vista…
            </span>
        </div>
    </div>
);

/**
 * Este componente se encarga de renderizar solo las rutas que
 * corresponden a cada rol según el Feature Registry.
 */
const DynamicRoutes = ({ role }) => {
    const roleRoutes = getRoutesByRole(role);

    return (
        <Suspense fallback={<NestedRouteLoader />}>
            <Routes>
                {/* Todas las vistas del dashboard empiezan por el Home (Overview) */}
                <Route index element={<OverviewHome />} />

                {/* Inyectamos dinámicamente todas las rutas de las features registradas */}
                {roleRoutes.map((route, index) => (
                    <Route 
                        key={`${role}-${index}`} 
                        path={route.path} 
                        element={route.element} 
                    />
                ))}

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </Suspense>
    );
};

export default DynamicRoutes;
