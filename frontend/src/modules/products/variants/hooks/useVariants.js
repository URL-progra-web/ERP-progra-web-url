import { useState, useEffect, useCallback } from 'react';
import { variantService } from '../services/variantService';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';

export function useVariants() {
    const [variants, setVariants] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [uoms, setUoms] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilterState] = useState('');
    const [productFilter, setProductFilterState] = useState('');
    const [entrepreneurFilter, setEntrepreneurFilterState] = useState('');
    const [businessUnitFilter, setBusinessUnitFilterState] = useState('');
    const [colorFilter, setColorFilterState] = useState('');
    const [sizeFilter, setSizeFilterState] = useState('');
    const [uomFilter, setUomFilterState] = useState('');

    const normalize = (result) => Array.isArray(result) ? result : result.results || [];

    const fetchVariants = useCallback(async () => {
        try {
            setIsLoading(true);

            const result = await variantService.getVariants({
                search: searchTerm || undefined,
                is_active: activeFilter === '' ? undefined : activeFilter,
                product: productFilter || undefined,
                entrepreneur: entrepreneurFilter || undefined,
                business_unit: businessUnitFilter || undefined,
                color: colorFilter || undefined,
                size: sizeFilter || undefined,
                uom: uomFilter || undefined,
                page,
                page_size: DEFAULT_PAGE_SIZE,
            });

            const data = normalize(result);
            setVariants(data);
            setCount(result?.count ?? data.length);
            setNumPages(result?.num_pages ?? 1);
            setError(null);
        } catch {
            setError('Error al cargar variantes.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, activeFilter, productFilter, entrepreneurFilter, businessUnitFilter, colorFilter, sizeFilter, uomFilter, page]);

    const fetchRelations = useCallback(async () => {
        try {
            const [productsRes, entrepreneursRes, businessUnitsRes, colorsRes, sizesRes, uomsRes] = await Promise.all([
                variantService.getProducts(),
                variantService.getEntrepreneurs(),
                variantService.getBusinessUnits(),
                variantService.getColors(),
                variantService.getSizes(),
                variantService.getUoms(),
            ]);

            setProducts(normalize(productsRes));
            setEntrepreneurs(normalize(entrepreneursRes));
            setBusinessUnits(normalize(businessUnitsRes));
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

    const setActiveFilter = (value) => {
        setPage(1);
        setActiveFilterState(value);
    };

    const setProductFilter = (value) => {
        setPage(1);
        setProductFilterState(value);
    };

    const setEntrepreneurFilter = (value) => {
        setPage(1);
        setEntrepreneurFilterState(value);
    };

    const setBusinessUnitFilter = (value) => {
        setPage(1);
        setBusinessUnitFilterState(value);
    };

    const setColorFilter = (value) => {
        setPage(1);
        setColorFilterState(value);
    };

    const setSizeFilter = (value) => {
        setPage(1);
        setSizeFilterState(value);
    };

    const setUomFilter = (value) => {
        setPage(1);
        setUomFilterState(value);
    };

    const handleSearch = () => {
        setPage(1);
        setSearchTerm(searchInput);
    };

    const resetFilters = () => {
        setActiveFilterState('');
        setProductFilterState('');
        setEntrepreneurFilterState('');
        setBusinessUnitFilterState('');
        setColorFilterState('');
        setSizeFilterState('');
        setUomFilterState('');
        setSearchInput('');
        setSearchTerm('');
        setPage(1);
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
        count,
        numPages,
        page,
        setPage,
        products,
        entrepreneurs,
        businessUnits,
        colors,
        sizes,
        uoms,
        isLoading,
        error,
        setError,
        searchInput, setSearchInput,
        handleSearch,
        activeFilter, setActiveFilter,
        productFilter, setProductFilter,
        entrepreneurFilter, setEntrepreneurFilter,
        businessUnitFilter, setBusinessUnitFilter,
        colorFilter, setColorFilter,
        sizeFilter, setSizeFilter,
        uomFilter, setUomFilter,
        resetFilters,
        saveVariant,
        deleteVariant,
    };
}
