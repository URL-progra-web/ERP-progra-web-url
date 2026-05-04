import React from 'react';
import { FiBox, FiGrid, FiPackage, FiDroplet } from 'react-icons/fi';
import { FiTag } from 'react-icons/fi';
import { FiLayers } from 'react-icons/fi';
import { FiSliders } from 'react-icons/fi';

const UomsPage = React.lazy(() => import('./uoms/UomsPage'));
const CategoriesPage = React.lazy(() => import('./categories/pages/CategoriesPage'));
const ProductsPage = React.lazy(() => import('./products/pages/ProductsPage'));
const ProductBulkPage = React.lazy(() => import('./products/bulk/ProductBulkPage'));
const ColorsPage = React.lazy(() => import('./colors/pages/ColorsPage'));
const SizesPage = React.lazy(() => import('./sizes/pages/SizesPage'));
const VariantsPage = React.lazy(() => import('./variants/pages/VariantsPage'));
const InventoryAdjustmentsPage = React.lazy(() => import('./inventory/pages/InventoryAdjustmentsPage'));

export const productsFeature = {
    id: 'products',
    group: 'Productos',
    items: [
        {
            text: 'Categorías',
            path: 'categories',
            icon: FiGrid,
            roles: ['ADMIN'],
            element: <CategoriesPage />,
        },
        {
            text: 'Productos',
            path: 'products',
            icon: FiPackage,
            roles: ['ADMIN'],
            element: <ProductsPage />,
        },
        {
            text: 'Carga masiva de productos',
            path: 'products/bulk',
            icon: FiPackage,
            roles: ['ADMIN'],
            hidden: true,
            element: <ProductBulkPage />,
        },
        {
            text: 'Colores',
            path: 'colors',
            icon: FiDroplet,
            roles: ['ADMIN'],
            element: <ColorsPage />,
        },
        {
            text: 'Unidades de Medida',
            path: 'uoms',
            icon: FiBox,
            roles: ['ADMIN'],
            element: <UomsPage />,
        },
        {
            text: 'Tallas',
            path: 'sizes',
            icon: FiTag,
            roles: ['ADMIN'],
            element: <SizesPage />,
        },
        {
            text: 'Variantes',
            path: 'variants',
            icon: FiLayers,
            roles: ['ADMIN'],
            element: <VariantsPage />,
        },
        {
            text: 'Ajuste de Inventario',
            path: 'inventory-adjustments',
            icon: FiSliders,
            roles: ['ADMIN'],
            element: <InventoryAdjustmentsPage />,
        },
    ]
};
