import { useState, useEffect, useCallback } from 'react';
import { variantService } from '~/modules/products/variants/services/variantService';
import { uomService } from '~/modules/products/uoms/services/uomService';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';

const normalize = (result) => Array.isArray(result) ? result : result?.results || [];

export const useVariantCatalog = () => {
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
    const [conversionsByBaseUom, setConversionsByBaseUom] = useState({});

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [productFilter, setProductFilterState] = useState('');
    const [entrepreneurFilter, setEntrepreneurFilterState] = useState('');
    const [businessUnitFilter, setBusinessUnitFilterState] = useState('');
    const [colorFilter, setColorFilterState] = useState('');
    const [sizeFilter, setSizeFilterState] = useState('');
    const [uomFilter, setUomFilterState] = useState('');

    const fetchVariants = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await variantService.getVariants({
                search: searchTerm || undefined,
                is_active: true,
                in_stock: true,
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
            setError('No se pudo cargar el catalogo de variantes.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, productFilter, entrepreneurFilter, businessUnitFilter, colorFilter, sizeFilter, uomFilter, page]);

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
            setError((prev) => prev || 'No se pudieron cargar los filtros del catalogo.');
        }
    }, []);

    useEffect(() => {
        const loadApplicableConversions = async () => {
            const baseUomIds = [...new Set(variants.flatMap((variant) => variant.base_uom ? [variant.base_uom] : []))];
            if (!baseUomIds.length) {
                setConversionsByBaseUom({});
                return;
            }

            try {
                const responses = await Promise.all(
                    baseUomIds.map(async (baseUomId) => {
                        const result = await uomService.getApplicableConversions(baseUomId);
                        return [baseUomId, normalize(result)];
                    })
                );
                setConversionsByBaseUom(Object.fromEntries(responses));
            } catch {
                setError((prev) => prev || 'No se pudieron cargar las conversiones aplicables.');
            }
        };

        loadApplicableConversions();
    }, [variants]);

    useEffect(() => {
        fetchVariants();
    }, [fetchVariants]);

    useEffect(() => {
        fetchRelations();
    }, [fetchRelations]);

    const handleSearch = useCallback(() => {
        setPage(1);
        setSearchTerm(searchInput);
    }, [searchInput]);

    const setProductFilter = useCallback((value) => {
        setPage(1);
        setProductFilterState(value);
    }, []);

    const setEntrepreneurFilter = useCallback((value) => {
        setPage(1);
        setEntrepreneurFilterState(value);
    }, []);

    const setBusinessUnitFilter = useCallback((value) => {
        setPage(1);
        setBusinessUnitFilterState(value);
    }, []);

    const setColorFilter = useCallback((value) => {
        setPage(1);
        setColorFilterState(value);
    }, []);

    const setSizeFilter = useCallback((value) => {
        setPage(1);
        setSizeFilterState(value);
    }, []);

    const setUomFilter = useCallback((value) => {
        setPage(1);
        setUomFilterState(value);
    }, []);

    const resetFilters = useCallback(() => {
        setSearchInput('');
        setSearchTerm('');
        setProductFilterState('');
        setEntrepreneurFilterState('');
        setBusinessUnitFilterState('');
        setColorFilterState('');
        setSizeFilterState('');
        setUomFilterState('');
        setPage(1);
    }, []);

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
        conversionsByBaseUom,
        isLoading,
        error,
        setError,
        searchInput,
        setSearchInput,
        handleSearch,
        productFilter,
        setProductFilter,
        entrepreneurFilter,
        setEntrepreneurFilter,
        businessUnitFilter,
        setBusinessUnitFilter,
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
