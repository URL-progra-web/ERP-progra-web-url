import React from 'react';

/**
 * Spinner de carga reutilizable
 * @param {Object} props
 * @param {string} props.size - Tamaño: 'sm' | 'md' | 'lg'
 * @param {string} props.className - Clases adicionales
 */
export default function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-primary border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
