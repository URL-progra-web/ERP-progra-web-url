import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [leafFilter, setLeafFilter] = useState('');

    const debouncedSearch = useDebounce(searchInput);

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await categoryService.getCategories({
                search: debouncedSearch || undefined,
                is_leaf: leafFilter === 'leaf' ? 'true' : leafFilter === 'parent' ? 'false' : undefined,
            });
            const data = Array.isArray(result) ? result : result.results || [];
            setCategories(data);
            setError(null);
        } catch {
            setError('Error al cargar categorías.');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, leafFilter]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const saveCategory = async (data, id = null) => {
        if (id) {
            await categoryService.updateCategory(id, data);
        } else {
            await categoryService.createCategory(data);
        }
        fetchCategories();
    };

    const deleteCategory = async (id) => {
        await categoryService.deleteCategory(id);
        fetchCategories();
    };

    return {
        categories,
        isLoading,
        error,
        searchInput, setSearchInput,
        leafFilter, setLeafFilter,
        saveCategory,
        deleteCategory,
    };
}
