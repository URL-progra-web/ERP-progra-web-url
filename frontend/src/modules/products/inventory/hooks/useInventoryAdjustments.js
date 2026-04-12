import { useState, useEffect, useCallback } from "react";
import { inventoryService } from "../services/inventoryService";
import { categoryService } from "../../categories/services/categoryService";

export function useInventoryAdjustments() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const normalize = (result) =>
    Array.isArray(result) ? result : result.results || [];

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await inventoryService.getProducts({
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
      });
      setProducts(normalize(result));
      setError(null);
    } catch {
      setError("Error al cargar productos.");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  const fetchRelations = useCallback(async () => {
    const [categoriesRes, typesRes] = await Promise.allSettled([
      categoryService.getCategories(),
      inventoryService.getTransactionTypes(),
    ]);

    if (categoriesRes.status === "fulfilled") {
      setCategories(normalize(categoriesRes.value));
    }

    if (typesRes.status === "fulfilled") {
      setTransactionTypes(normalize(typesRes.value));
    }

    if (categoriesRes.status === "rejected" || typesRes.status === "rejected") {
      setError((prev) => prev || "Error al cargar catálogos de soporte.");
    }
  }, []);

  useEffect(() => {
    fetchRelations();
  }, [fetchRelations]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = () => {
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

  return {
    products,
    categories,
    transactionTypes,
    isLoading,
    error,
    searchInput,
    setSearchInput,
    handleSearch,
    categoryFilter,
    setCategoryFilter,
    createAdjustment,
    getProductVariants,
  };
}
