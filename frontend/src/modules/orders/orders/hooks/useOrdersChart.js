import { useState, useCallback, useEffect } from 'react';
import { orderStatusesService } from '../../orderStatuses/services/orderStatusesService';

/**
 * Hook that fetches daily order stats per status.
 *
 * @param {object} options
 * @param {string}   options.dateFrom   - 'YYYY-MM-DD' or ''
 * @param {string}   options.dateTo     - 'YYYY-MM-DD' or ''
 * @param {string[]} options.statuses   - list of status names to request (empty = all)
 * @param {boolean}  options.autoFetch  - run on mount (default true)
 */
export const useOrdersChart = ({
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
            const data = await orderStatusesService.statsDailyOrders({
                date_from: dateFrom || undefined,
                date_to:   dateTo   || undefined,
                statuses:  statuses.length ? statuses : undefined,
            });
            setChartData(data);
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al cargar las estadísticas');
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
