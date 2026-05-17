import { useState, useEffect, useCallback } from 'react';
import { sizeService } from '../services/sizeService';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';

export function useSizes() {
    const [sizes, setSizes] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSizes = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await sizeService.getSizes({
                search: searchTerm || undefined,
                page,
                page_size: DEFAULT_PAGE_SIZE,
            });

            const data = Array.isArray(result) ? result : result.results || [];
            setSizes(data);
            setCount(result?.count ?? data.length);
            setNumPages(result?.num_pages ?? 1);
            setError(null);
        } catch {
            setError('Error al cargar tallas.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, page]);

    const parseError = (err, fallback) => (
        err?.response?.data?.error
        || err?.response?.data?.message
        || fallback
    );

    useEffect(() => {
        fetchSizes();
    }, [fetchSizes]);

    const handleSearch = () => {
        setPage(1);
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
        try {
            await sizeService.deleteSize(id);
            await fetchSizes();
            return true;
        } catch (err) {
            setError(parseError(err, 'No se pudo eliminar la talla.'));
            return false;
        }
    };

    return {
        sizes,
        count,
        numPages,
        page,
        setPage,
        isLoading,
        error,
        searchInput, setSearchInput,
        handleSearch,
        saveSize,
        deleteSize,
    };
}
