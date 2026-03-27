import { useCallback, useEffect, useState } from 'react';
import { customerService } from '~/modules/crm/customers/services/customerService';
import { normalizeList } from '../helpers/normalizeList';

export const useCustomerSearch = ({ initialQuery = '' } = {}) => {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setQuery(initialQuery || '');
    }, [initialQuery]);

    const search = useCallback(async (overrideQuery) => {
        const q = (overrideQuery ?? query).trim();
        if (!q) {
            setResults([]);
            setError('');
            return;
        }
        setIsSearching(true);
        setError('');
        try {
            const data = await customerService.list({ search: q, page: 1, page_size: 10 });
            setResults(normalizeList(data));
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('No se pudo buscar clientes. Intente de nuevo.');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [query]);

    const clearResults = useCallback(() => {
        setResults([]);
        setError('');
    }, []);

    return {
        query,
        setQuery,
        results,
        isSearching,
        error,
        search,
        clearResults,
    };
};
