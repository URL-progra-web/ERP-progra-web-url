// src/core/registry/mockRegistry.js
// Cada equipo importa aquí sus datos de prueba
import { usersMocks } from '../../modules/users/users.mocks';

export const ALL_MOCKS = {
    ...usersMocks,
    // inventory: inventoryMocks,
    // sales: salesMocks,
};

/**
 * Utilidad para obtener datos de un módulo específico
 */
export const getMockData = (featureId) => {
    return ALL_MOCKS[featureId] || [];
};
