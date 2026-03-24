import { useState, useEffect, useCallback } from 'react';
import { variantService } from '../services/variantService';

export function useVariants() {
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [uoms, setUoms] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('');

    const normalize = (result) => Array.isArray(result) ? result : result.results || [];

    const fetchVariants = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await variantService.getVariants({
                search: searchTerm || undefined,
                is_active: activeFilter === '' ? undefined : activeFilter,
            });

            setVariants(normalize(result));
            setError(null);
        } catch {
            setError('Error al cargar variantes.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, activeFilter]);

    const fetchRelations = useCallback(async () => {
        try {
            const [productsRes, colorsRes, sizesRes, uomsRes] = await Promise.all([
                variantService.getProducts(),
                variantService.getColors(),
                variantService.getSizes(),
                variantService.getUoms(),
            ]);

            setProducts(normalize(productsRes));
            setColors(normalize(colorsRes));
            setSizes(normalize(sizesRes));
            setUoms(normalize(uomsRes));
        } catch {
            setError('Error al cargar datos relacionados.');
        }
    }, []);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    useEffect(() => {
        fetchRelations();
    }, [fetchRelations]);

    const handleSearch = () => {
        setSearchTerm(searchInput);
    };

    const saveVariant = async (data, id = null) => {
        if (id) {
            await variantService.updateVariant(id, data);
        } else {
            await variantService.createVariant(data);
        }
        fetchVariants();
    };

    const deleteVariant = async (id) => {
        await variantService.deleteVariant(id);
        fetchVariants();
    };

    return {
        variants,
        products,
        colors,
        sizes,
        uoms,
        isLoading,
        error,
        searchInput, setSearchInput,
        handleSearch,
        activeFilter, setActiveFilter,
        saveVariant,
        deleteVariant,
    };
}