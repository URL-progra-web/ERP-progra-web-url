import { useState, useEffect, useCallback } from 'react';
import { variantService } from '~/modules/products/variants/services/variantService';
import { uomService } from '~/modules/products/uoms/services/uomService';

const normalize = (result) => Array.isArray(result) ? result : result?.results || [];

export const useVariantCatalog = () => {
    const [variants, setVariants] = useState([]);
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
    const [productFilter, setProductFilter] = useState('');
    const [entrepreneurFilter, setEntrepreneurFilter] = useState('');
    const [businessUnitFilter, setBusinessUnitFilter] = useState('');
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
                entrepreneur: entrepreneurFilter || undefined,
                business_unit: businessUnitFilter || undefined,
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
    }, [searchTerm, productFilter, entrepreneurFilter, businessUnitFilter, colorFilter, sizeFilter, uomFilter]);

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
            const baseUomIds = [...new Set(variants.map((variant) => variant.base_uom).filter(Boolean))];
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
        setSearchTerm(searchInput);
    }, [searchInput]);

    const resetFilters = useCallback(() => {
        setSearchInput('');
        setSearchTerm('');
        setProductFilter('');
        setEntrepreneurFilter('');
        setBusinessUnitFilter('');
        setColorFilter('');
        setSizeFilter('');
        setUomFilter('');
    }, []);

    return {
        variants,
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
