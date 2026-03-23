import { useState, useEffect, useCallback } from 'react';
import { sizeService } from '../services/sizeService';

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export function useSizes() {
    const [sizes, setSizes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');

    const debouncedSearch = useDebounce(searchInput);

    const fetchSizes = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await sizeService.getSizes({
                search: debouncedSearch || undefined,
            });

            const data = Array.isArray(result) ? result : result.results || [];
            setSizes(data);
            setError(null);
        } catch {
            setError('Error al cargar tallas.');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchSizes();
    }, [fetchSizes]);

    const saveSize = async (data, id = null) => {
        if (id) {
            await sizeService.updateSize(id, data);
        } else {
            await sizeService.createSize(data);
        }
        fetchSizes();
    };

    const deleteSize = async (id) => {
        await sizeService.deleteSize(id);
        fetchSizes();
    };

    return {
        sizes,
        isLoading,
        error,
        searchInput, setSearchInput,
        saveSize,
        deleteSize,
    };
}