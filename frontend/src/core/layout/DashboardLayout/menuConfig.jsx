import { posMenu } from '@/features/pos/posMenu';
import { inventoryMenu } from '@/features/inventory/inventoryMenu';
import { hrMenu } from '@/features/hr/hrMenu';
import { usersMenu } from '@/features/users/usersMenu';

export const menuConfig = [
    ...posMenu,
    ...inventoryMenu,
    ...hrMenu,
    ...usersMenu,
];
