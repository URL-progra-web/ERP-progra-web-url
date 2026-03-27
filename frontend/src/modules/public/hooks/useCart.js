import { useState, useEffect, useCallback } from 'react';

const CART_STORAGE_KEY = 'erp_cart';

export const useCart = () => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Cargar carrito de localStorage al montar
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((variant, product, quantity = 1) => {
    setItems(prevItems => {
      const existingIndex = prevItems.findIndex(
        item => item.variant_id === variant.id
      );

      if (existingIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingIndex].quantity += quantity;
        return newItems;
      }

      return [
        ...prevItems,
        {
          variant_id: variant.id,
          product_id: product.id,
          product_name: product.name,
          variant_sku: variant.sku,
          size_name: variant.size_name,
          color_name: variant.color_name,
          price: parseFloat(variant.price),
          quantity,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((variantId) => {
    setItems(prevItems => prevItems.filter(item => item.variant_id !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    if (quantity <= 0) {
      setItems(prevItems => prevItems.filter(item => item.variant_id !== variantId));
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.variant_id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalAmount = useCallback(() => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalAmount,
    openCart,
    closeCart,
    toggleCart,
  };
};
