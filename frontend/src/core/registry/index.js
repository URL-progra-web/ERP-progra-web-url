import { usersFeature } from '../../modules/users/users.config';

/**
 * Los 28 programadores solo tocarán este archivo una vez:
 * 1. Para importar su módulo (config).
 * 2. Para añadirlo al array REGISTERED_FEATURES.
 */
export const REGISTERED_FEATURES = [
    usersFeature,
    // Inventario: inventoryFeature,
    // Ventas: salesFeature,
];
