import api from "~/core/api/api";

export const inventoryService = {
  getProducts: async ({ search, category } = {}) => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    const response = await api.get("/products/products/", { params });
    return response.data;
  },

  getTransactionTypes: async () => {
    const response = await api.get("/inventory/transaction-types/");
    return response.data;
  },

  getTransactions: async (productId = null) => {
    const params = {};
    if (productId) params.product = productId;
    const response = await api.get("/inventory/transactions/", { params });
    return response.data;
  },

  createTransaction: async (data) => {
    const response = await api.post("/inventory/transactions/", data);
    return response.data;
  },

  getVariants: async (productId) => {
    const response = await api.get(`/products/products/${productId}/variants/`);
    return response.data;
  },

  getStock: async (variantId) => {
    const response = await api.get(`/inventory/stock/?variant=${variantId}`);
    return response.data;
  },
};
