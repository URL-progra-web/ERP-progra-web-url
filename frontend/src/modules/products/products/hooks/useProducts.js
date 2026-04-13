import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../../categories/services/categoryService';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [categories, setCategories] = useState([]);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilterState] = useState('');
    const [entrepreneurFilter, setEntrepreneurFilterState] = useState('');
    const [businessUnitFilter, setBusinessUnitFilterState] = useState('');
    const [baseUomFilter, setBaseUomFilterState] = useState('');

    const normalize = (result) => Array.isArray(result) ? result : result.results || [];

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await productService.getProducts({
                search: searchTerm || undefined,
                category: categoryFilter || undefined,
                entrepreneur: entrepreneurFilter || undefined,
                business_unit: businessUnitFilter || undefined,
                base_uom: baseUomFilter || undefined,
                page,
                page_size: DEFAULT_PAGE_SIZE,
            });
            const data = normalize(result);
            setProducts(data);
            setCount(result?.count ?? data.length);
            setNumPages(result?.num_pages ?? 1);
            setError(null);
        } catch {
            setError('Error al cargar productos.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, categoryFilter, entrepreneurFilter, businessUnitFilter, baseUomFilter, page]);

    const fetchRelations = useCallback(async () => {
        const [categoriesRes, entrepreneursRes, businessUnitsRes, uomsRes] = await Promise.allSettled([
            categoryService.getCategories(),
            productService.getEntrepreneurs(),
            productService.getBusinessUnits(),
            productService.getUoms(),
        ]);

        if (categoriesRes.status === 'fulfilled') {
            setCategories(normalize(categoriesRes.value));
        }

        if (entrepreneursRes.status === 'fulfilled') {
            setEntrepreneurs(normalize(entrepreneursRes.value));
        }

        if (businessUnitsRes.status === 'fulfilled') {
            setBusinessUnits(normalize(businessUnitsRes.value));
        }

        if (uomsRes.status === 'fulfilled') {
            setUoms(normalize(uomsRes.value));
        }

        if (
            categoriesRes.status === 'rejected' ||
            entrepreneursRes.status === 'rejected' ||
            businessUnitsRes.status === 'rejected' ||
            uomsRes.status === 'rejected'
        ) {
            setError((prev) => prev || 'Error al cargar catálogos de soporte.');
        }
    }, []);

    useEffect(() => {
        fetchRelations();
    }, [fetchRelations]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const setCategoryFilter = (value) => {
        setPage(1);
        setCategoryFilterState(value);
    };

    const setEntrepreneurFilter = (value) => {
        setPage(1);
        setEntrepreneurFilterState(value);
    };

    const setBusinessUnitFilter = (value) => {
        setPage(1);
        setBusinessUnitFilterState(value);
    };

    const setBaseUomFilter = (value) => {
        setPage(1);
        setBaseUomFilterState(value);
    };

    const handleSearch = () => {
        setPage(1);
        setSearchTerm(searchInput);
    };

    const saveProduct = async (data, id = null) => {
        if (id) {
            await productService.updateProduct(id, data);
        } else {
            await productService.createProduct(data);
        }
        fetchProducts();
    };

    const deleteProduct = async (id) => {
        await productService.deleteProduct(id);
        fetchProducts();
    };

    return {
        products,
        count,
        numPages,
        page,
        setPage,
        categories,
        entrepreneurs,
        businessUnits,
        uoms,
        isLoading,
        error,
        searchInput, setSearchInput,
        handleSearch,
        categoryFilter, setCategoryFilter,
        entrepreneurFilter, setEntrepreneurFilter,
        businessUnitFilter, setBusinessUnitFilter,
        baseUomFilter, setBaseUomFilter,
        saveProduct,
        deleteProduct,
    };
}
