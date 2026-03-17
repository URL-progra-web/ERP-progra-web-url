import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { getRoutesByRole } from './registryUtils';
import OverviewHome from '../../modules/Overview/pages/OverviewHome';
import NotFoundPage from '../../modules/misc/pages/NotFoundPage';

/**
 * Este componente se encarga de renderizar solo las rutas que
 * corresponden a cada rol según el Feature Registry.
 */
const DynamicRoutes = ({ role }) => {
    const roleRoutes = getRoutesByRole(role);

    return (
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
    );
};

export default DynamicRoutes;
