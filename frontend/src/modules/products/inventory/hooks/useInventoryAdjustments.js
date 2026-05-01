import { useState, useEffect, useCallback } from "react";
import { inventoryService } from "../services/inventoryService";
import { categoryService } from "../../categories/services/categoryService";
import { userService } from "../../../users/services/userService";
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
  const [transactions, setTransactions] = useState([]);
  const [transactionsCount, setTransactionsCount] = useState(0);
  const [transactionsNumPages, setTransactionsNumPages] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [variants, setVariants] = useState([]);
  const [users, setUsers] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilterState] = useState("");
  const [transactionVariantFilter, setTransactionVariantFilter] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState("");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

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

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await inventoryService.getTransactions({
        variant_id: transactionVariantFilter || undefined,
        transaction_type: transactionTypeFilter || undefined,
        date_from: dateFromFilter || undefined,
        date_to: dateToFilter || undefined,
        page: transactionsPage,
        page_size: DEFAULT_PAGE_SIZE,
      });
      const data = normalize(result);
      setTransactions(data);
      setTransactionsCount(result?.count ?? data.length);
      setTransactionsNumPages(result?.num_pages ?? 1);
      setError(null);
    } catch {
      setError("Error al cargar el historial de transacciones.");
    } finally {
      setIsLoading(false);
    }
  }, [transactionVariantFilter, transactionTypeFilter, dateFromFilter, dateToFilter, transactionsPage]);

  const fetchVariants = useCallback(async () => {
    try {
      const result = await inventoryService.getVariants();
      const data = normalize(result);
      setVariants(data);
    } catch {
      // Silently fail - variants are optional for the filter
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await userService.getUsers({ page_size: 100 });
      const data = normalize(result);
      setUsers(data);
      const map = {};
      data.forEach((user) => {
        map[user.id] = user.name || user.email || `Usuario ${user.id}`;
      });
      setUserMap(map);
    } catch {
      // Silently fail - users are optional
    }
  }, []);

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

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
    transactions,
    transactionsCount,
    transactionsNumPages,
    transactionsPage,
    setTransactionsPage,
    variants,
    users,
    userMap,
    transactionVariantFilter,
    setTransactionVariantFilter,
    transactionTypeFilter,
    setTransactionTypeFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
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
    fetchTransactions,
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,
    exportTransactions: async ({ variant_id, transaction_type, date_from, date_to } = {}) => {
      await inventoryService.exportExcel({
        variant_id: variant_id || undefined,
        transaction_type: transaction_type || undefined,
        date_from: date_from || undefined,
        date_to: date_to || undefined,
      });
    },
  };
}
