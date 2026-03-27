import { useCallback, useEffect, useMemo, useState } from 'react';

const CART_COOKIE_NAME = 'order_create_cart';
const CART_COOKIE_DAYS = 7;

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clampOperationQuantity = (quantity, stock, conversionMultiplier) => {
    const normalized = Math.max(1, toNumber(quantity, 1));
    const stockValue = toNumber(stock, 0);
    const multiplier = Math.max(toNumber(conversionMultiplier, 1), 1);
    if (stockValue <= 0) return 0;
    const maxOperationalQuantity = Math.floor(stockValue / multiplier);
    if (maxOperationalQuantity <= 0) return 0;
    return Math.min(normalized, maxOperationalQuantity);
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
            const stock = Math.max(0, toNumber(item.stock, 0));

            if (!variantId) return null;

            return {
                variant_id: variantId,
                sku: item.sku || '',
                product_name: item.product_name || 'Producto sin nombre',
                color_name: item.color_name || '',
                size_name: item.size_name || '',
                base_uom_name: item.base_uom_name || '',
                selected_uom_id: toNumber(item.selected_uom_id, null),
                selected_uom_name: item.selected_uom_name || '',
                conversion_multiplier: toNumber(item.conversion_multiplier, 1),
                base_quantity: toNumber(item.base_quantity, 0),
                unit_price: toNumber(item.unit_price),
                stock,
                quantity: clampOperationQuantity(item.quantity, stock, item.conversion_multiplier),
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

    const addVariant = useCallback((variant, quantity = 1, selectedUom = null) => {
        const stock = toNumber(variant.quantity_available);
        const conversionMultiplier = Number(selectedUom?.multiplier || 1);
        const nextQuantity = clampOperationQuantity(quantity, stock, conversionMultiplier);
        if (nextQuantity <= 0) return;
        const selectedUomId = Number(selectedUom?.id || variant.base_uom || 0);
        const selectedUomName = selectedUom?.name || variant.base_uom_name || '';

        setItems((prev) => {
            const existing = prev.find(
                (item) => Number(item.variant_id) === Number(variant.id)
                    && Number(item.selected_uom_id) === selectedUomId
            );
            if (existing) {
                return prev.map((item) => (
                    Number(item.variant_id) === Number(variant.id) && Number(item.selected_uom_id) === selectedUomId
                        ? {
                            ...item,
                            quantity: clampOperationQuantity(item.quantity + nextQuantity, stock, conversionMultiplier),
                            base_quantity: clampOperationQuantity(item.quantity + nextQuantity, stock, conversionMultiplier) * conversionMultiplier,
                            stock,
                            unit_price: toNumber(variant.price, item.unit_price),
                            conversion_multiplier: conversionMultiplier,
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
                base_uom_name: variant.base_uom_name || '',
                selected_uom_id: selectedUomId,
                selected_uom_name: selectedUomName,
                conversion_multiplier: conversionMultiplier,
                unit_price: toNumber(variant.price),
                stock,
                quantity: nextQuantity,
                base_quantity: nextQuantity * conversionMultiplier,
            }];
        });
    }, []);

    const removeItem = useCallback((variantId, selectedUomId) => {
        setItems((prev) => prev.filter(
            (item) => !(Number(item.variant_id) === Number(variantId) && Number(item.selected_uom_id) === Number(selectedUomId))
        ));
    }, []);

    const updateQuantity = useCallback((variantId, selectedUomId, quantity) => {
        setItems((prev) => prev.map((item) => (
            Number(item.variant_id) === Number(variantId) && Number(item.selected_uom_id) === Number(selectedUomId)
                ? {
                    ...item,
                    quantity: clampOperationQuantity(quantity, item.stock, item.conversion_multiplier),
                    base_quantity: clampOperationQuantity(quantity, item.stock, item.conversion_multiplier) * toNumber(item.conversion_multiplier, 1),
                }
                : item
        )));
    }, []);

    const incrementItem = useCallback((variantId, selectedUomId) => {
        setItems((prev) => prev.map((item) => (
            Number(item.variant_id) === Number(variantId) && Number(item.selected_uom_id) === Number(selectedUomId)
                ? {
                    ...item,
                    quantity: clampOperationQuantity(item.quantity + 1, item.stock, item.conversion_multiplier),
                    base_quantity: clampOperationQuantity(item.quantity + 1, item.stock, item.conversion_multiplier) * toNumber(item.conversion_multiplier, 1),
                }
                : item
        )));
    }, []);

    const decrementItem = useCallback((variantId, selectedUomId) => {
        setItems((prev) => prev.flatMap((item) => {
            if (Number(item.variant_id) !== Number(variantId) || Number(item.selected_uom_id) !== Number(selectedUomId)) return [item];
            if (item.quantity <= 1) return [];
            return [{
                ...item,
                quantity: item.quantity - 1,
                base_quantity: (item.quantity - 1) * toNumber(item.conversion_multiplier, 1),
            }];
        }));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const summary = useMemo(() => {
        const totalQuantity = items.reduce((sum, item) => sum + item.base_quantity, 0);
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
