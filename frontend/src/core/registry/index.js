import { usersFeature } from '../../modules/users/users.config';
import { productsFeature } from '../../modules/products/products.config';
import { ordersFeature } from '../../modules/orders/orders.config';
import { crmFeature } from '../../modules/crm/crm.config';
import { receiptsFeature } from "../../modules/receipts/receipts.config";

/**
 * Los 28 programadores solo tocarán este archivo una vez:
 * 1. Para importar su módulo (config).
 * 2. Para añadirlo al array REGISTERED_FEATURES.
 */
export const REGISTERED_FEATURES = [
    usersFeature,
    productsFeature,
    ordersFeature,
    crmFeature,
    receiptsFeature,
    // Inventario: inventoryFeature,
    // Ventas: salesFeature,
];

