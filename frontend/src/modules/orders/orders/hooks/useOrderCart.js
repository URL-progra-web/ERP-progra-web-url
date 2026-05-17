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

const clampBaseQuantity = (quantity, stock) => clampOperationQuantity(quantity, stock, 1);

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

    const mergedByVariant = payload.reduce((acc, rawItem) => {
        const variantId = toNumber(rawItem.variant_id, null);
        if (!variantId) return acc;

        const key = String(variantId);
        const stock = Math.max(0, toNumber(rawItem.stock, 0));
        const multiplier = Math.max(toNumber(rawItem.conversion_multiplier, 1), 1);
        const rawBaseQty = toNumber(rawItem.base_quantity, toNumber(rawItem.quantity, 0) * multiplier);

        if (!acc[key]) {
            acc[key] = {
                variant_id: variantId,
                sku: rawItem.sku || '',
                product_name: rawItem.product_name || 'Producto sin nombre',
                color_name: rawItem.color_name || '',
                size_name: rawItem.size_name || '',
                base_uom_id: toNumber(rawItem.base_uom_id, rawItem.selected_uom_id),
                base_uom_name: rawItem.base_uom_name || rawItem.selected_uom_name || '',
                unit_price: toNumber(rawItem.unit_price),
                stock,
                desired_base_quantity: 0,
            };
        }

        acc[key].desired_base_quantity += Math.max(0, rawBaseQty);
        acc[key].stock = Math.max(acc[key].stock, stock);

        return acc;
    }, {});

    return Object.values(mergedByVariant)
        .flatMap((item) => {
            const allowedBaseQty = clampBaseQuantity(item.desired_base_quantity, item.stock);
            if (allowedBaseQty <= 0) return [];

            return [{
                variant_id: item.variant_id,
                sku: item.sku,
                product_name: item.product_name,
                color_name: item.color_name,
                size_name: item.size_name,
                base_uom_id: item.base_uom_id,
                base_uom_name: item.base_uom_name,
                selected_uom_id: item.base_uom_id,
                selected_uom_name: item.base_uom_name,
                conversion_multiplier: 1,
                base_quantity: allowedBaseQty,
                quantity: allowedBaseQty,
                unit_price: item.unit_price,
                stock: item.stock,
            }];
        });
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
        const selectedMultiplier = Math.max(toNumber(selectedUom?.multiplier, 1), 1);
        const baseUomId = Number(variant.base_uom || 0);
        const baseUomName = variant.base_uom_name || '';

        setItems((prev) => {
            const existing = prev.find((item) => Number(item.variant_id) === Number(variant.id));
            const addedBaseQty = Math.max(1, toNumber(quantity, 1)) * selectedMultiplier;

            if (existing) {
                const nextBaseQuantity = clampBaseQuantity(existing.base_quantity + addedBaseQty, stock);
                if (nextBaseQuantity <= 0) return prev;

                return prev.map((item) => (
                    Number(item.variant_id) === Number(variant.id)
                        ? {
                            ...item,
                            quantity: nextBaseQuantity,
                            base_quantity: nextBaseQuantity,
                            stock,
                            unit_price: toNumber(variant.price, item.unit_price),
                            selected_uom_id: baseUomId,
                            selected_uom_name: baseUomName,
                            conversion_multiplier: 1,
                        }
                        : item
                ));
            }

            const initialBaseQuantity = clampBaseQuantity(addedBaseQty, stock);
            if (initialBaseQuantity <= 0) return prev;

            return [...prev, {
                variant_id: Number(variant.id),
                sku: variant.sku,
                product_name: variant.product_name || 'Producto sin nombre',
                color_name: variant.color_name || '',
                size_name: variant.size_name || '',
                base_uom_name: baseUomName,
                base_uom_id: baseUomId,
                selected_uom_id: baseUomId,
                selected_uom_name: baseUomName,
                conversion_multiplier: 1,
                unit_price: toNumber(variant.price),
                stock,
                quantity: initialBaseQuantity,
                base_quantity: initialBaseQuantity,
            }];
        });
    }, []);

    const removeItem = useCallback((variantId) => {
        setItems((prev) => prev.filter(
            (item) => Number(item.variant_id) !== Number(variantId)
        ));
    }, []);

    const updateQuantity = useCallback((variantId, _selectedUomId, quantity) => {
        setItems((prev) => prev.map((item) => (
            Number(item.variant_id) === Number(variantId)
                ? {
                    ...item,
                    quantity: clampBaseQuantity(quantity, item.stock),
                    base_quantity: clampBaseQuantity(quantity, item.stock),
                }
                : item
        )));
    }, []);

    const incrementItem = useCallback((variantId) => {
        setItems((prev) => prev.map((item) => (
            Number(item.variant_id) === Number(variantId)
                ? {
                    ...item,
                    quantity: clampBaseQuantity(item.quantity + 1, item.stock),
                    base_quantity: clampBaseQuantity(item.quantity + 1, item.stock),
                }
                : item
        )));
    }, []);

    const decrementItem = useCallback((variantId) => {
        setItems((prev) => prev.flatMap((item) => {
            if (Number(item.variant_id) !== Number(variantId)) return [item];
            if (item.quantity <= 1) return [];
            return [{
                ...item,
                quantity: item.quantity - 1,
                base_quantity: item.quantity - 1,
            }];
        }));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const summary = useMemo(() => {
        const totalQuantity = items.reduce((sum, item) => sum + item.base_quantity, 0);
        const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.base_quantity), 0);

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
