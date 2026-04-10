import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../../categories/services/categoryService';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [uoms, setUoms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [entrepreneurFilter, setEntrepreneurFilter] = useState('');
    const [businessUnitFilter, setBusinessUnitFilter] = useState('');
    const [baseUomFilter, setBaseUomFilter] = useState('');

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
            });
            setProducts(normalize(result));
            setError(null);
        } catch {
            setError('Error al cargar productos.');
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, categoryFilter, entrepreneurFilter, businessUnitFilter, baseUomFilter]);

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

    const handleSearch = () => {
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
