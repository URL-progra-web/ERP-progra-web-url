import { useState, useEffect, useCallback } from "react";
import { inventoryService } from "../services/inventoryService";
import { categoryService } from "../../categories/services/categoryService";
import { DEFAULT_PAGE_SIZE } from "~/core/constants/pagination";

export function useInventoryAdjustments() {
  const [products, setProducts] = useState([]);
  const [productsCount, setProductsCount] = useState(0);
  const [productsNumPages, setProductsNumPages] = useState(1);
  const [productsPage, setProductsPage] = useState(1);
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [typesCount, setTypesCount] = useState(0);
  const [typesNumPages, setTypesNumPages] = useState(1);
  const [typesPage, setTypesPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilterState] = useState("");

  const normalize = (result) =>
    Array.isArray(result) ? result : result.results || [];

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await inventoryService.getProducts({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        page: productsPage,
        page_size: DEFAULT_PAGE_SIZE,
      });
      const data = normalize(result);
      setProducts(data);
      setProductsCount(result?.count ?? data.length);
      setProductsNumPages(result?.num_pages ?? 1);
      setError(null);
    } catch {
      setError("Error al cargar productos.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter, productsPage]);

  const fetchTransactionTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await inventoryService.getTransactionTypes({
        page: typesPage,
        page_size: DEFAULT_PAGE_SIZE,
      });
      const data = normalize(result);
      setTransactionTypes(data);
      setTypesCount(result?.count ?? data.length);
      setTypesNumPages(result?.num_pages ?? 1);
      setError(null);
    } catch {
      setError("Error al cargar tipos de transacción.");
    } finally {
      setIsLoading(false);
    }
  }, [typesPage]);

  const fetchRelations = useCallback(async () => {
    const [categoriesRes] = await Promise.allSettled([
      categoryService.getCategories(),
    ]);

    if (categoriesRes.status === "fulfilled") {
      setCategories(normalize(categoriesRes.value));
    }

    if (categoriesRes.status === "rejected") {
      setError((prev) => prev || "Error al cargar catálogos de soporte.");
    }
  }, []);

  useEffect(() => {
    fetchRelations();
  }, [fetchRelations]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchTransactionTypes();
  }, [fetchTransactionTypes]);

  const setCategoryFilter = (value) => {
    setProductsPage(1);
    setCategoryFilterState(value);
  };

  const handleSearch = () => {
    setProductsPage(1);
    setSearchTerm(searchInput);
  };

  const createAdjustment = async (data) => {
    await inventoryService.createTransaction(data);
    fetchProducts();
  };

  const getProductVariants = async (productId) => {
    const response = await inventoryService.getVariants(productId);
    return normalize(response);
  };

  const createTransactionType = async (data) => {
    await inventoryService.createTransactionType(data);
    fetchTransactionTypes();
  };

  const updateTransactionType = async (name, data) => {
    await inventoryService.updateTransactionType(name, data);
    fetchTransactionTypes();
  };

  const deleteTransactionType = async (name) => {
    await inventoryService.deleteTransactionType(name);
    fetchTransactionTypes();
  };

  return {
    products,
    productsCount,
    productsNumPages,
    productsPage,
    setProductsPage,
    categories,
    transactionTypes,
    typesCount,
    typesNumPages,
    typesPage,
    setTypesPage,
    isLoading,
    error,
    setError,
    searchInput,
    setSearchInput,
    handleSearch,
    categoryFilter,
    setCategoryFilter,
    createAdjustment,
    getProductVariants,
    fetchTransactionTypes,
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,
  };
}
