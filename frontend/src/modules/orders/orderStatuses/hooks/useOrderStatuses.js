import { useCallback, useEffect, useState } from 'react';
import { orderStatusesService } from '../services/orderStatusesService';

export const useOrderStatuses = () => {
    const [statuses, setStatuses] = useState([]);
    const [search, setSearch] = useState('');
    const [workflow, setWorkflow] = useState({ workflow: {}, terminal_statuses: [] });
    const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);
    const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(true);
    const [error, setError] = useState(null);

    const fetchStatuses = useCallback(async () => {
        try {
            setIsLoadingStatuses(true);
            const data = await orderStatusesService.list({ search: search || undefined });
            setStatuses(data.results || []);
            setError(null);
        } catch (err) {
            const message = err?.response?.data?.error || 'No fue posible cargar los estados.';
            setError(message);
        } finally {
            setIsLoadingStatuses(false);
        }
    }, [search]);

    const fetchWorkflow = useCallback(async () => {
        try {
            setIsLoadingWorkflow(true);
            const data = await orderStatusesService.workflow();
            setWorkflow(data);
        } catch (err) {
            const message = err?.response?.data?.error || 'No se pudo cargar el flujo de estados.';
            setError(message);
        } finally {
            setIsLoadingWorkflow(false);
        }
    }, []);

    useEffect(() => { fetchStatuses(); }, [fetchStatuses]);
    useEffect(() => { fetchWorkflow(); }, [fetchWorkflow]);

    return {
        statuses,
        search,
        setSearch,
        workflow,
        isLoadingStatuses,
        isLoadingWorkflow,
        error,
        setError,
    };
};
