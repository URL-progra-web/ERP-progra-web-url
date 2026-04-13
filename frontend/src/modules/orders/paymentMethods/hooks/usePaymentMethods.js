import { useCallback, useEffect, useMemo, useState } from 'react';
import { paymentMethodsService } from '../services/paymentMethodsService';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';

export const usePaymentMethods = () => {
    const [records, setRecords] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isActiveFilter = useMemo(() => {
        if (statusFilter === 'active') return true;
        if (statusFilter === 'inactive') return false;
        return undefined;
    }, [statusFilter]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await paymentMethodsService.list({
                search: search || undefined,
                is_active: typeof isActiveFilter === 'boolean' ? isActiveFilter : undefined,
                page,
                page_size: DEFAULT_PAGE_SIZE,
            });
            setRecords(data.results);
            setCount(data.count);
            setNumPages(data.num_pages);
            setError(null);
        } catch (err) {
            const message = err?.response?.data?.error || 'No fue posible cargar los métodos de pago.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [search, isActiveFilter, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const refresh = () => fetchData();

    const toggleActive = async (method) => {
        await paymentMethodsService.updateState(method.id, { is_active: !method.is_active });
        refresh();
    };

    const savePaymentMethod = async (payload, id = null) => {
        if (id) {
            await paymentMethodsService.updateState(id, payload);
        } else {
            await paymentMethodsService.create(payload);
        }
        refresh();
    };

    const deletePaymentMethod = async (id) => {
        try {
            await paymentMethodsService.delete(id);
            refresh();
            return null;
        } catch (err) {
            return err?.response?.data?.error || 'No se pudo eliminar el método de pago.';
        }
    };

    return {
        records,
        count,
        numPages,
        page,
        setPage,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        isLoading,
        error,
        setError,
        toggleActive,
        savePaymentMethod,
        deletePaymentMethod,
        refresh,
    };
};
