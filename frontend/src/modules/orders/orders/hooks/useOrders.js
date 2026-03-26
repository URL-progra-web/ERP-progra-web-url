import { useState, useCallback, useEffect } from 'react';
import { normalizePaginated } from '../helpers/normalizeList';
import { orderService } from '../services/orderService';

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 15;

export const useOrders = ({ autoFetch = true } = {}) => {
    const [data, setData] = useState({ results: [], count: 0, num_pages: 1, page: 1 });
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(searchInput);

    const parseError = (err, fallback) => (
        err.response?.data?.error ||
        err.response?.data?.message ||
        fallback
    );

    const fetchOrders = useCallback(async () => {
        setIsLoadingOrders(true);
        setError(null);
        try {
            const response = await orderService.list({
                search: debouncedSearch || undefined,
                page,
                page_size: PAGE_SIZE,
            });
            setData(normalizePaginated(response, page));
        } catch (err) {
            setError(parseError(err, 'Error al cargar los pedidos'));
        } finally {
            setIsLoadingOrders(false);
        }
    }, [debouncedSearch, page]);

    const createOrder = useCallback(async (payload) => {
        try {
            setError(null);
            const created = await orderService.create(payload);
            await fetchOrders();
            return created;
        } catch (err) {
            setError(parseError(err, 'Error al crear el pedido'));
            return null;
        }
    }, [fetchOrders]);

    const fetchOrderDetail = useCallback(async (orderId) => {
        try {
            setError(null);
            return await orderService.get(orderId);
        } catch (err) {
            setError(parseError(err, 'Error al cargar el detalle del pedido'));
            return null;
        }
    }, []);

    const updateOrder = useCallback(async (orderId, payload) => {
        try {
            setError(null);
            const updated = await orderService.update(orderId, payload);
            await fetchOrders();
            return updated;
        } catch (err) {
            setError(parseError(err, 'Error al actualizar el pedido'));
            return null;
        }
    }, [fetchOrders]);

    const deleteOrder = useCallback(async (orderId) => {
        try {
            setError(null);
            await orderService.remove(orderId);
            await fetchOrders();
            return true;
        } catch (err) {
            setError(parseError(err, 'Error al eliminar el pedido'));
            return false;
        }
    }, [fetchOrders]);

    useEffect(() => {
        if (!autoFetch) return;
        fetchOrders();
    }, [autoFetch, fetchOrders]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    return {
        orders: data.results,
        count: data.count,
        numPages: data.num_pages,
        page,
        setPage,
        search: searchInput,
        setSearch: setSearchInput,
        isLoadingOrders,
        error,
        setError,
        createOrder,
        fetchOrderDetail,
        updateOrder,
        deleteOrder,
        fetchOrders,
    };
};
