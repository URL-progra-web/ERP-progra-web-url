import { useCallback, useEffect, useState } from 'react';
import { orderItemsService } from '../services/orderItemsService';
import { normalizeList } from '../helpers/normalizeList';

export const useOrderItems = ({ orderId }) => {
    const [items, setItems] = useState([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [error, setError] = useState(null);

    const parseError = (err, fallback) => {
        const data = err.response?.data;
        if (!data) return fallback;
        if (typeof data === 'string') return data;
        if (data.error) return data.error;
        if (data.message) return data.message;
        if (data.detail) return data.detail;

        const firstKey = Object.keys(data)[0];
        const firstValue = firstKey ? data[firstKey] : null;
        if (Array.isArray(firstValue) && firstValue.length) return String(firstValue[0]);
        if (typeof firstValue === 'string') return firstValue;
        return fallback;
    };

    const fetchItems = useCallback(async () => {
        if (!orderId) {
            setItems([]);
            return;
        }
        setIsLoadingItems(true);
        setError(null);
        try {
            const data = await orderItemsService.list({ order_id: Number(orderId) });
            setItems(normalizeList(data));
        } catch (err) {
            setError(parseError(err, 'Error al cargar los items del pedido'));
        } finally {
            setIsLoadingItems(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const createItem = async ({ variant_id, quantity, status_id }) => {
        try {
            setError(null);
            const payload = {
                order_id: Number(orderId),
                variant_id: Number(variant_id),
                quantity: Number(quantity),
            };
            if (status_id) payload.status_id = Number(status_id);
            await orderItemsService.create(payload);
            await fetchItems();
            return true;
        } catch (err) {
            setError(parseError(err, 'Error al crear el item'));
            return false;
        }
    };

    const updateItem = async (itemId, { quantity, status_id }) => {
        try {
            setError(null);
            const payload = {};
            if (quantity !== undefined && quantity !== null && quantity !== '') {
                payload.quantity = Number(quantity);
            }
            if (status_id) {
                payload.status_id = Number(status_id);
            }
            await orderItemsService.update(itemId, payload);
            await fetchItems();
            return true;
        } catch (err) {
            setError(parseError(err, 'Error al actualizar el item'));
            return false;
        }
    };

    const deleteItem = async (itemId) => {
        try {
            setError(null);
            await orderItemsService.remove(itemId);
            await fetchItems();
            return true;
        } catch (err) {
            setError(parseError(err, 'Error al eliminar el item'));
            return false;
        }
    };

    return {
        items,
        isLoadingItems,
        error,
        setError,
        fetchItems,
        createItem,
        updateItem,
        deleteItem,
    };
};
