import { useCallback, useEffect, useState } from 'react';
import { entrepreneurService } from '../services/entrepreneurService';

const PAGE_SIZE = 12;

export const useEntrepreneurs = () => {
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [users, setUsers] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    
    // Filtros locales (los que se editan en el formulario)
    const [search, setSearch] = useState('');
    const [createdFrom, setCreatedFrom] = useState('');
    const [createdTo, setCreatedTo] = useState('');
    
    // Filtros aplicados (los que se usan para la búsqueda real)
    const [appliedSearch, setAppliedSearch] = useState('');
    const [appliedCreatedFrom, setAppliedCreatedFrom] = useState('');
    const [appliedCreatedTo, setAppliedCreatedTo] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEntrepreneurs = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await entrepreneurService.list({
                search: appliedSearch || undefined,
                created_from: appliedCreatedFrom || undefined,
                created_to: appliedCreatedTo || undefined,
                page,
                page_size: PAGE_SIZE,
            });
            setEntrepreneurs(data.results);
            setCount(data.count);
            setNumPages(data.num_pages);
            setError(null);
        } catch (err) {
            const message = err?.response?.data?.error || 'No fue posible cargar emprendedores.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [appliedSearch, appliedCreatedFrom, appliedCreatedTo, page]);

    const fetchUsers = useCallback(async () => {
        try {
            const data = await entrepreneurService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Error al cargar usuarios:', err);
        }
    }, []);

    useEffect(() => { fetchEntrepreneurs(); }, [fetchEntrepreneurs]);
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const saveEntrepreneur = async (payload, id = null) => {
        if (id) {
            await entrepreneurService.update(id, payload);
        } else {
            await entrepreneurService.create(payload);
        }
        fetchEntrepreneurs();
    };

    const deleteEntrepreneur = async (id) => {
        try {
            await entrepreneurService.remove(id);
            fetchEntrepreneurs();
            return null;
        } catch (err) {
            return err?.response?.data?.error || 'No se pudo eliminar el emprendedor.';
        }
    };

    const applyFilters = () => {
        setAppliedSearch(search);
        setAppliedCreatedFrom(createdFrom);
        setAppliedCreatedTo(createdTo);
        setPage(1); // Reset a página 1 al aplicar filtros
    };

    return {
        entrepreneurs,
        users,
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
        saveEntrepreneur,
        deleteEntrepreneur,
        applyFilters,
        refetch: fetchEntrepreneurs,
    };
};
