import { useState, useEffect, useCallback } from 'react';
import { colorService } from '../services/colorService';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';

export function useColors() {
    const [colors, setColors] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchColors = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await colorService.getColors({
                search: searchTerm || undefined,
                page,
                page_size: DEFAULT_PAGE_SIZE,
            });

            const data = Array.isArray(result) ? result : result.results || [];
            setColors(data);
            setCount(result?.count ?? data.length);
            setNumPages(result?.num_pages ?? 1);
            setError(null);
        } catch {
            setError('Error al cargar colores.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, page]);

    useEffect(() => {
        fetchColors();
    }, [fetchColors]);

    const handleSearch = () => {
        setPage(1);
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
        count,
        numPages,
        page,
        setPage,
        isLoading,
        error,
        searchInput, setSearchInput,
        handleSearch,
        saveColor,
        deleteColor,
    };
}
