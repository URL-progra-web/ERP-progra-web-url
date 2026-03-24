import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { categoryService } from '../../categories/services/categoryService';

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [entrepreneurs, setEntrepreneurs] = useState([]);
    const [businessUnits, setBusinessUnits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [searchInput, setSearchInput] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const debouncedSearch = useDebounce(searchInput);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await productService.getProducts({
                search: debouncedSearch || undefined,
                category: categoryFilter || undefined,
            });
            const data = Array.isArray(result) ? result : result.results || [];
            setProducts(data);
            setError(null);
        } catch {
            setError('Error al cargar productos.');
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, categoryFilter]);

    useEffect(() => {
        categoryService.getCategories().then((res) => {
            const data = Array.isArray(res) ? res : res.results || [];
            setCategories(data);
        }).catch(() => {});
        productService.getEntrepreneurs().then((res) => {
            const data = Array.isArray(res) ? res : res.results || [];
            setEntrepreneurs(data);
        }).catch(() => {});
        productService.getBusinessUnits().then((res) => {
            const data = Array.isArray(res) ? res : res.results || [];
            setBusinessUnits(data);
        }).catch(() => {});
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

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
        isLoading,
        error,
        searchInput, setSearchInput,
        categoryFilter, setCategoryFilter,
        saveProduct,
        deleteProduct,
    };
}
