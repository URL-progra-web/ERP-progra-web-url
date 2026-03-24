import { useState, useEffect, useCallback } from 'react';
import { colorService } from '../services/colorService';

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export function useColors() {
    const [colors, setColors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');

    const debouncedSearch = useDebounce(searchInput);

    const fetchColors = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await colorService.getColors({
                search: debouncedSearch || undefined,
            });

            const data = Array.isArray(result) ? result : result.results || [];
            setColors(data);
            setError(null);
        } catch {
            setError('Error al cargar colores.');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    const saveColor = async (data, id = null) => {
        if (id) {
            await colorService.updateColor(id, data);
        } else {
            await colorService.createColor(data);
        }
        fetchColors();
    };

    const deleteColor = async (id) => {
        await colorService.deleteColor(id);
        fetchColors();
    };

    return {
        colors,
        isLoading,
        error,
        searchInput, setSearchInput,
        saveColor,
        deleteColor,
    };
}