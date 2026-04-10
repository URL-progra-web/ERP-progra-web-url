import { useState, useEffect, useCallback } from 'react';
import { publicService } from '../services/publicService';

export const usePublicProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [categoryPath, setCategoryPath] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page_size: 24, ...initialParams });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publicService.getProducts(params);
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchCategoriesTree = useCallback(async () => {
    try {
      const data = await publicService.getCategoriesTree();
      setCategoriesTree(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading categories tree:', err);
    }
  }, []);

  const fetchCategoryPath = useCallback(async (categoryId) => {
    if (!categoryId) {
      setCategoryPath([]);
      return;
    }
    try {
      const data = await publicService.getCategoryPath(categoryId);
      setCategoryPath(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading category path:', err);
      setCategoryPath([]);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategoriesTree();
  }, [fetchCategoriesTree]);

  // Actualizar breadcrumb cuando cambia la categoría
  useEffect(() => {
    fetchCategoryPath(params.category);
  }, [params.category, fetchCategoryPath]);

  const setCategory = useCallback((categoryId) => {
    setParams(prev => ({
      ...prev,
      category: categoryId || undefined,
    }));
  }, []);

  const setSearch = useCallback((search) => {
    setParams(prev => ({
      ...prev,
      search: search || undefined,
    }));
  }, []);

  // Aplicar filtros de variantes (tallas, colores, precio)
  const applyFilters = useCallback((filterParams) => {
    setParams(prev => {
      // Remover filtros anteriores
      const { sizes, colors, min_price, max_price, ...rest } = prev;
      return {
        ...rest,
        ...filterParams,
      };
    });
  }, []);

  // Limpiar todos los filtros excepto categoría y búsqueda
  const clearFilters = useCallback(() => {
    setParams(prev => ({
      category: prev.category,
      search: prev.search,
    }));
  }, []);

  return {
    products,
    categoriesTree,
    categoryPath,
    loading,
    error,
    params,
    setCategory,
    setSearch,
    applyFilters,
    clearFilters,
    refresh: fetchProducts,
  };
};
