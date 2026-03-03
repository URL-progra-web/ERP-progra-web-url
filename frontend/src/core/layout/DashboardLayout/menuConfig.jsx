import { posMenu } from '~pos/posMenu';
import { inventoryMenu } from '~inventory/inventoryMenu';
import { hrMenu } from '~hr/hrMenu';
import { usersMenu } from '~users/usersMenu';

export const menuConfig = [
    ...posMenu,
    ...inventoryMenu,
    ...hrMenu,
    ...usersMenu,
];
