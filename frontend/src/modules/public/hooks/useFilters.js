import { useState, useEffect, useCallback } from 'react';
import { publicService } from '../services/publicService';

export const useFilters = (categoryId = null) => {
  const [filters, setFilters] = useState({
    sizes: [],
    colors: [],
    price_range: { min: 0, max: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de filtros seleccionados
  const [selectedFilters, setSelectedFilters] = useState({
    sizes: [],
    colors: [],
    minPrice: null,
    maxPrice: null,
  });

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = categoryId ? { category: categoryId } : {};
      const data = await publicService.getFilters(params);
      setFilters(data);
    } catch (err) {
      setError(err.message || 'Error al cargar filtros');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  // Toggle de talla seleccionada
  const toggleSize = useCallback((sizeId) => {
    setSelectedFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(sizeId)
        ? prev.sizes.filter(id => id !== sizeId)
        : [...prev.sizes, sizeId],
    }));
  }, []);

  // Toggle de color seleccionado
  const toggleColor = useCallback((colorId) => {
    setSelectedFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(id => id !== colorId)
        : [...prev.colors, colorId],
    }));
  }, []);

  // Establecer rango de precios
  const setPriceRange = useCallback((minPrice, maxPrice) => {
    setSelectedFilters(prev => ({
      ...prev,
      minPrice,
      maxPrice,
    }));
  }, []);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      sizes: [],
      colors: [],
      minPrice: null,
      maxPrice: null,
    });
  }, []);

  // Construir params para la API
  const getFilterParams = useCallback(() => {
    const params = {};
    
    if (selectedFilters.sizes.length > 0) {
      params.sizes = selectedFilters.sizes.join(',');
    }
    
    if (selectedFilters.colors.length > 0) {
      params.colors = selectedFilters.colors.join(',');
    }
    
    if (selectedFilters.minPrice !== null) {
      params.min_price = selectedFilters.minPrice;
    }
    
    if (selectedFilters.maxPrice !== null) {
      params.max_price = selectedFilters.maxPrice;
    }
    
    return params;
  }, [selectedFilters]);

  // Verificar si hay filtros activos
  const hasActiveFilters = selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    selectedFilters.minPrice !== null ||
    selectedFilters.maxPrice !== null;

  return {
    filters,
    loading,
    error,
    selectedFilters,
    toggleSize,
    toggleColor,
    setPriceRange,
    clearFilters,
    getFilterParams,
    hasActiveFilters,
    refresh: fetchFilters,
  };
};
