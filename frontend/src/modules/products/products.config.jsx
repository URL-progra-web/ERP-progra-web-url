import React from 'react';
import { FiBox } from 'react-icons/fi';
import UomsPage from './uoms/UomsPage';

export const productsFeature = {
    id: 'products',
    group: 'Productos',
    items: [
        {
            text: 'Unidades de Medida',
            path: 'uoms',
            icon: FiBox,
            roles: ['ADMIN'],
            element: <UomsPage />,
        }
    ]
};
