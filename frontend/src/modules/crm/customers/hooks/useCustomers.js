import { useCallback, useEffect, useState } from 'react';
import { customerService } from '../services/customerService';

const PAGE_SIZE = 12;

export const useCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await customerService.list({
                search: search || undefined,
                created_from: createdFrom || undefined,
                created_to: createdTo || undefined,
                page,
                page_size: PAGE_SIZE,
            });
            setCustomers(data.results);
            setCount(data.count);
            setNumPages(data.num_pages);
            setError(null);
        } catch (err) {
            const message = err?.response?.data?.error || 'No fue posible cargar clientes.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [search, createdFrom, createdTo, page]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const saveCustomer = async (payload, id = null) => {
        if (id) {
            await customerService.update(id, payload);
        } else {
            await customerService.create(payload);
        }
        fetchCustomers();
    };

    const deleteCustomer = async (id) => {
        try {
            await customerService.remove(id);
            fetchCustomers();
            return null;
        } catch (err) {
            return err?.response?.data?.error || 'No se pudo eliminar el cliente.';
        }
    };

    return {
        customers,
        count,
        numPages,
        page,
        setPage,
        search,
        setSearch,
        createdFrom,
        setCreatedFrom,
        createdTo,
        setCreatedTo,
        isLoading,
        error,
        setError,
        saveCustomer,
        deleteCustomer,
        refetch: fetchCustomers,
    };
};
