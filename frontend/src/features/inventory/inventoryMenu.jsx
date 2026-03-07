import { Package, Warehouse} from 'lucide-react';

export const inventoryMenu = [
    {
        to: '/app/inventory',
        label: 'Inventario',
        icon: Package,
        children: [
            {
                to: "/app/inventory/warehouses",
                label: "Bodegas",
                icon: Warehouse,
            },
        ],
    },
];
