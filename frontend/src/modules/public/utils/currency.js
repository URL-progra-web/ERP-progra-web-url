/**
 * Formatea un monto como precio en Quetzales (GTQ).
 * @param {number|string} amount - El monto a formatear
 * @returns {string} - El precio formateado como "Q 99.00"
 */
export const formatPrice = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return 'Q 0.00';
  return `Q ${num.toFixed(2)}`;
};

/**
 * Formatea un rango de precios.
 * @param {number} min - Precio mínimo
 * @param {number} max - Precio máximo
 * @returns {string} - Rango formateado como "Q 50.00 - Q 200.00"
 */
export const formatPriceRange = (min, max) => {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};
