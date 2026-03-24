import React from 'react';
import { FiBox, FiGrid, FiPackage, FiDroplet } from 'react-icons/fi';
import UomsPage from './uoms/UomsPage';
import CategoriesPage from './categories/pages/CategoriesPage';
import ProductsPage from './products/pages/ProductsPage';
import ColorsPage from './colors/pages/ColorsPage';
import SizesPage from './sizes/pages/SizesPage';
import { FiTag } from 'react-icons/fi';
import VariantsPage from './variants/pages/VariantsPage';
import { FiLayers } from 'react-icons/fi';

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
    ]
};