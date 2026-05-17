import { useCallback, useEffect, useMemo, useState } from 'react';
import { customerService } from '~/modules/crm/customers/services/customerService';
import { normalizeList } from '../helpers/normalizeList';

const SEARCH_MODE_CONFIG = {
    general: {
        label: 'Todo',
        placeholder: 'Nombre, correo o telefono',
    },
    name: {
        label: 'Nombre',
        placeholder: 'Ej. Maria Lopez',
    },
    email: {
        label: 'Correo',
        placeholder: 'Ej. cliente@correo.com',
    },
    phone: {
        label: 'Telefono',
        placeholder: 'Ej. 5555 1234',
    },
};

const normalizeText = (value) => String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const normalizePhone = (value) => String(value ?? '').replace(/\D/g, '');

const getCustomerField = (customer, mode) => {
    if (mode === 'name') return customer.name || '';
    if (mode === 'email') return customer.email || '';
    if (mode === 'phone') return customer.phone || '';
    return `${customer.name || ''} ${customer.email || ''} ${customer.phone || ''}`;
};

const rankResults = (customers, query, mode) => {
    const normalizedQuery = mode === 'phone'
        ? normalizePhone(query)
        : normalizeText(query);

    if (!normalizedQuery) return customers;

    const scored = customers.map((customer) => {
        const rawField = getCustomerField(customer, mode);
        const normalizedField = mode === 'phone'
            ? normalizePhone(rawField)
            : normalizeText(rawField);

        if (!normalizedField) {
            return { customer, score: 0 };
        }

        let score = 0;
        if (normalizedField === normalizedQuery) score += 100;
        if (normalizedField.startsWith(normalizedQuery)) score += 60;
        if (normalizedField.includes(normalizedQuery)) score += 30;

        if (mode === 'general') {
            const name = normalizeText(customer.name);
            const email = normalizeText(customer.email);
            const phone = normalizePhone(customer.phone);

            if (name.startsWith(normalizeText(query))) score += 10;
            if (email.startsWith(normalizeText(query))) score += 8;
            if (phone.startsWith(normalizePhone(query))) score += 8;
        }

        return { customer, score };
    });

    const matches = scored.filter((entry) => entry.score > 0);
    const source = matches.length ? matches : scored;

    return source
        .sort((left, right) => right.score - left.score)
        .map((entry) => entry.customer);
};

export const useCustomerSearch = ({ initialQuery = '' } = {}) => {
    const [query, setQuery] = useState(initialQuery);
    const [mode, setMode] = useState('general');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setQuery(initialQuery || '');
    }, [initialQuery]);

    const search = useCallback(async (overrideQuery, overrideMode) => {
        const q = (overrideQuery ?? query).trim();
        const activeMode = overrideMode ?? mode;
        if (!q) {
            setResults([]);
            setError('');
            return;
        }
        setIsSearching(true);
        setError('');
        try {
            const data = await customerService.list({ search: q, page: 1, page_size: 15 });
            const normalized = normalizeList(data);
            setResults(rankResults(normalized, q, activeMode));
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('No se pudo buscar clientes. Intente de nuevo.');
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [mode, query]);

    const clearResults = useCallback(() => {
        setResults([]);
        setError('');
    }, []);

    const placeholder = useMemo(
        () => SEARCH_MODE_CONFIG[mode]?.placeholder || SEARCH_MODE_CONFIG.general.placeholder,
        [mode]
    );

    return {
        query,
        setQuery,
        mode,
        setMode,
        modeOptions: Object.entries(SEARCH_MODE_CONFIG).map(([value, config]) => ({
            value,
            label: config.label,
        })),
        placeholder,
        results,
        isSearching,
        error,
        search,
        clearResults,
    };
};
