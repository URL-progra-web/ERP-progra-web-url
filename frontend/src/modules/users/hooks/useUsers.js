import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debounced;
}

const PAGE_SIZE = 15;

export function useUsers() {
    const [data, setData] = useState({ results: [], count: 0, num_pages: 1, page: 1 });
    const [roles, setRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchInput, setSearchInput] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(searchInput);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = await userService.getUsers({
                page,
                page_size: PAGE_SIZE,
                search: debouncedSearch || undefined,
                role_id: roleFilter || undefined,
                is_active:
                    statusFilter === 'active' ? 'true' :
                    statusFilter === 'blocked' ? 'false' :
                    undefined,
            });
            setData(result);
            setError(null);
        } catch {
            setError('Error al cargar usuarios. Intente nuevamente.');
        } finally {
            setIsLoading(false);
        }
    }, [page, debouncedSearch, roleFilter, statusFilter]);

    // Load roles once
    useEffect(() => {
        userService.getRoles().then(setRoles).catch(() => {});
    }, []);

    // Re-fetch when filters or page change
    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Reset to page 1 when filters change
    useEffect(() => { setPage(1); }, [debouncedSearch, roleFilter, statusFilter]);

    const toggleStatus = async (userId) => {
        try {
            await userService.toggleActiveStatus(userId);
            fetchUsers();
        } catch {
            setError('Error al cambiar el estado del usuario');
        }
    };

    const saveUser = async (userData, userId = null) => {
        if (userId) {
            await userService.updateUser(userId, userData);
        } else {
            await userService.createUser(userData);
        }
        fetchUsers();
    };

    return {
        users: data.results,
        count: data.count,
        numPages: data.num_pages,
        roles,
        isLoading,
        error,
        // Filter state & setters
        searchInput, setSearchInput,
        roleFilter, setRoleFilter,
        statusFilter, setStatusFilter,
        page, setPage,
        // Actions
        toggleStatus,
        saveUser,
    };
}
