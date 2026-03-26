import { useState, useEffect, useCallback } from 'react';
import { variantService } from '~/modules/products/variants/services/variantService';

const normalize = (result) => Array.isArray(result) ? result : result?.results || [];

export const useVariantCatalog = () => {
    const [variants, setVariants] = useState([]);
    const [products, setProducts] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [uoms, setUoms] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [productFilter, setProductFilter] = useState('');
    const [colorFilter, setColorFilter] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [uomFilter, setUomFilter] = useState('');

    const fetchVariants = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await variantService.getVariants({
                search: searchTerm || undefined,
                is_active: true,
                in_stock: true,
                product: productFilter || undefined,
                color: colorFilter || undefined,
                size: sizeFilter || undefined,
                uom: uomFilter || undefined,
            });
            setVariants(normalize(result));
            setError(null);
        } catch {
            setError('No se pudo cargar el catalogo de variantes.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, productFilter, colorFilter, sizeFilter, uomFilter]);

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
            setError((prev) => prev || 'No se pudieron cargar los filtros del catalogo.');
        }
    }, []);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    useEffect(() => {
        fetchRelations();
    }, [fetchRelations]);

    const handleSearch = useCallback(() => {
        setSearchTerm(searchInput);
    }, [searchInput]);

    const resetFilters = useCallback(() => {
        setSearchInput('');
        setSearchTerm('');
        setProductFilter('');
        setColorFilter('');
        setSizeFilter('');
        setUomFilter('');
    }, []);

    return {
        variants,
        products,
        colors,
        sizes,
        uoms,
        isLoading,
        error,
        setError,
        searchInput,
        setSearchInput,
        handleSearch,
        productFilter,
        setProductFilter,
        colorFilter,
        setColorFilter,
        sizeFilter,
        setSizeFilter,
        uomFilter,
        setUomFilter,
        resetFilters,
        refetch: fetchVariants,
    };
};
