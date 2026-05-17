import { useState, useEffect, useCallback } from 'react';
import { categoryService } from '../services/categoryService';

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [leafFilter, setLeafFilter] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await categoryService.getCategories({
                search: searchTerm || undefined,
                is_leaf: leafFilter === 'leaf' ? 'true' : leafFilter === 'parent' ? 'false' : undefined,
            });
            const data = Array.isArray(result) ? result : result.results || [];
            const normalized = data.map(category => ({
                ...category,
                is_leaf: normalizeBoolean(category.is_leaf),
            }));
            setCategories(normalized);
            setError(null);
        } catch {
            setError('Error al cargar categorías.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, leafFilter]);

    const parseError = (err, fallback) => (
        err?.response?.data?.error
        || err?.response?.data?.message
        || fallback
    );

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleSearch = () => {
        setSearchTerm(searchInput);
    };

    const saveCategory = async (data, id = null) => {
        if (id) {
            await categoryService.updateCategory(id, data);
        } else {
            await categoryService.createCategory(data);
        }
        fetchCategories();
    };

    const deleteCategory = async (id) => {
        try {
            await categoryService.deleteCategory(id);
            await fetchCategories();
            return true;
        } catch (err) {
            setError(parseError(err, 'No se pudo eliminar la categoría.'));
            return false;
        }
    };

    return {
        categories,
        isLoading,
        error,
        searchInput, setSearchInput,
        searchTerm, handleSearch,
        leafFilter, setLeafFilter,
        saveCategory,
        deleteCategory,
    };
}

function normalizeBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['true', '1', 't', 'yes', 'y'].includes(normalized)) return true;
        if (['false', '0', 'f', 'no', 'n'].includes(normalized)) return false;
    }
    return Boolean(value);
}
