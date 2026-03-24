import { useState, useEffect, useCallback } from 'react';
import { colorService } from '../services/colorService';

export function useColors() {
    const [colors, setColors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchColors = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await colorService.getColors({
                search: searchTerm || undefined,
            });

            const data = Array.isArray(result) ? result : result.results || [];
            setColors(data);
            setError(null);
        } catch {
            setError('Error al cargar colores.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    const handleSearch = () => {
        setSearchTerm(searchInput);
    };

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
        handleSearch,
        saveColor,
        deleteColor,
    };
}