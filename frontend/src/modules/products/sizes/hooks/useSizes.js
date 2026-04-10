import { useState, useEffect, useCallback } from 'react';
import { sizeService } from '../services/sizeService';

export function useSizes() {
    const [sizes, setSizes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSizes = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await sizeService.getSizes({
                search: searchTerm || undefined,
            });

            const data = Array.isArray(result) ? result : result.results || [];
            setSizes(data);
            setError(null);
        } catch {
            setError('Error al cargar tallas.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchSizes();
    }, [fetchSizes]);

    const handleSearch = () => {
        setSearchTerm(searchInput);
    };

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
        handleSearch,
        saveSize,
        deleteSize,
    };
}