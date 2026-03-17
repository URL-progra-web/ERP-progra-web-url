import { REGISTERED_FEATURES } from './index';

/**
 * Agrupa todas las features en el formato que el Sidebar.jsx necesita (por categorías).
 */
export const getNavigationConfig = () => {
    const groups = {};

    REGISTERED_FEATURES.forEach(feature => {
        if (!groups[feature.group]) {
            groups[feature.group] = {
                title: feature.group,
                items: []
            };
        }

        feature.items.forEach(item => {
            // Se calcula la ruta base dependiendo del rol principal que la vea (o la que se prefiera)
            // Tip: podemos añadir logic para que si el item es para admin se ponga /dashboard/admin/item.path
            const primaryRole = item.roles[0].toLowerCase(); // e.g., 'admin'
            
            groups[feature.group].items.push({
                ...item,
                path: `/dashboard/${primaryRole}/${item.path}`
            });
        });
    });

    return Object.values(groups);
};

/**
 * Devuelve todos los elementos de ruta filtrados por rol para el App.jsx.
 */
export const getRoutesByRole = (role) => {
    const routes = [];
    
    REGISTERED_FEATURES.forEach(feature => {
        feature.items.forEach(item => {
            if (item.roles.includes(role)) {
                routes.push({
                    path: item.path,
                    element: item.element
                });
            }
        });
    });

    return routes;
};
