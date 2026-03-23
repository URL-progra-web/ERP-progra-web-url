import React from 'react';
import { FiBox, FiGrid, FiPackage } from 'react-icons/fi';
import UomsPage from './uoms/UomsPage';
import CategoriesPage from './categories/pages/CategoriesPage';
import ProductsPage from './products/pages/ProductsPage';

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
            text: 'Unidades de Medida',
            path: 'uoms',
            icon: FiBox,
            roles: ['ADMIN'],
            element: <UomsPage />,
        },
    ]
};
