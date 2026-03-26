import { useCallback, useEffect, useMemo, useState } from 'react';

const CART_COOKIE_NAME = 'order_create_cart';
const CART_COOKIE_DAYS = 7;

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clampQuantity = (quantity, stock) => {
    const normalized = Math.max(1, toNumber(quantity, 1));
    const stockValue = toNumber(stock, normalized);
    if (stockValue <= 0) return 1;
    return Math.min(normalized, stockValue);
};

const setCookie = (name, value, days) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name) => document.cookie.split('; ').reduce((result, entry) => {
    const [key, ...rest] = entry.split('=');
    return key === name ? decodeURIComponent(rest.join('=')) : result;
}, '');

const removeCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};

const normalizeStoredItems = (payload) => {
    if (!Array.isArray(payload)) return [];

    return payload
        .map((item) => {
            const variantId = toNumber(item.variant_id, null);
            const stock = Math.max(1, toNumber(item.stock, 1));

            if (!variantId) return null;

            return {
                variant_id: variantId,
                sku: item.sku || '',
                product_name: item.product_name || 'Producto sin nombre',
                color_name: item.color_name || '',
                size_name: item.size_name || '',
                uom_name: item.uom_name || '',
                unit_price: toNumber(item.unit_price),
                stock,
                quantity: clampQuantity(item.quantity, stock),
            };
        })
        .filter(Boolean);
};

const loadInitialItems = () => {
    if (typeof document === 'undefined') return [];

    try {
        const rawValue = getCookie(CART_COOKIE_NAME);
        if (!rawValue) return [];
        return normalizeStoredItems(JSON.parse(rawValue));
    } catch {
        return [];
    }
};

export const useOrderCart = () => {
    const [items, setItems] = useState(loadInitialItems);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        if (!items.length) {
            removeCookie(CART_COOKIE_NAME);
            return;
        }

        setCookie(CART_COOKIE_NAME, JSON.stringify(items), CART_COOKIE_DAYS);
    }, [items]);

    const addVariant = useCallback((variant, quantity = 1) => {
        const stock = toNumber(variant.quantity_available);
        const nextQuantity = clampQuantity(quantity, stock);

        setItems((prev) => {
            const existing = prev.find((item) => Number(item.variant_id) === Number(variant.id));
            if (existing) {
                return prev.map((item) => (
                    Number(item.variant_id) === Number(variant.id)
                        ? {
                            ...item,
                            quantity: clampQuantity(item.quantity + nextQuantity, stock),
                            stock,
                            unit_price: toNumber(variant.price, item.unit_price),
                        }
                        : item
                ));
            }

            return [...prev, {
                variant_id: Number(variant.id),
                sku: variant.sku,
                product_name: variant.product_name || 'Producto sin nombre',
                color_name: variant.color_name || '',
                size_name: variant.size_name || '',
                uom_name: variant.uom_name || '',
                unit_price: toNumber(variant.price),
                stock,
                quantity: nextQuantity,
            }];
        });
    }, []);

    const removeItem = useCallback((variantId) => {
        setItems((prev) => prev.filter((item) => Number(item.variant_id) !== Number(variantId)));
    }, []);

    const updateQuantity = useCallback((variantId, quantity) => {
        setItems((prev) => prev.map((item) => (
            Number(item.variant_id) === Number(variantId)
                ? { ...item, quantity: clampQuantity(quantity, item.stock) }
                : item
        )));
    }, []);

    const incrementItem = useCallback((variantId) => {
        setItems((prev) => prev.map((item) => (
            Number(item.variant_id) === Number(variantId)
                ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stock) }
                : item
        )));
    }, []);

    const decrementItem = useCallback((variantId) => {
        setItems((prev) => prev.flatMap((item) => {
            if (Number(item.variant_id) !== Number(variantId)) return [item];
            if (item.quantity <= 1) return [];
            return [{ ...item, quantity: item.quantity - 1 }];
        }));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const summary = useMemo(() => {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

        return {
            totalItems: items.length,
            totalQuantity,
            subtotal,
        };
    }, [items]);

    return {
        items,
        addVariant,
        removeItem,
        updateQuantity,
        incrementItem,
        decrementItem,
        clearCart,
        summary,
    };
};
