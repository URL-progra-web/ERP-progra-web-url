import { useState, useCallback, useEffect } from 'react';
import { orderStatusesService } from '../../orderStatuses/services/orderStatusesService';

/**
 * Hook that fetches cumulative order stats per status.
 * Same API as useOrdersChart but calls the /stats/cumulative/ endpoint.
 */
export const useOrdersCumulative = ({
    dateFrom = '',
    dateTo = '',
    statuses = [],
    autoFetch = true,
} = {}) => {
    const [chartData, setChartData] = useState({ statuses: [], series: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await orderStatusesService.statsCumulativeOrders({
                date_from: dateFrom || undefined,
                date_to:   dateTo   || undefined,
                statuses:  statuses.length ? statuses : undefined,
            });
            setChartData(data);
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al cargar el acumulado');
        } finally {
            setIsLoading(false);
        }
    }, [dateFrom, dateTo, statuses.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!autoFetch) return;
        fetchStats();
    }, [autoFetch, fetchStats]);

    return { chartData, isLoading, error, fetchStats };
};
