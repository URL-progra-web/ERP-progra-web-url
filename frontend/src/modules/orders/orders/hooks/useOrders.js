import { useState, useCallback, useEffect } from 'react';
import { normalizeList } from '../helpers/normalizeList';
import { orderService } from '../services/orderService';

export const useOrders = () => {
    const [orders, setOrders] = useState([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    const fetchOrders = useCallback(async () => {
        setIsLoadingOrders(true);
        setError(null);
        try {
            const data = await orderService.list({ search });
            setOrders(normalizeList(data));
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cargar los pedidos');
        } finally {
            setIsLoadingOrders(false);
        }
    }, [search]);

    const createOrder = async (payload) => {
        try {
            setError(null);
            await orderService.create(payload);
            await fetchOrders();
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al crear el pedido');
            return false;
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    return {
        orders,
        search,
        setSearch,
        isLoadingOrders,
        error,
        setError,
        createOrder,
        fetchOrders,
    };
};
