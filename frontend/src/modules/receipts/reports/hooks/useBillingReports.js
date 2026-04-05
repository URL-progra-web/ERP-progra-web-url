import { useState, useEffect, useCallback } from 'react';
import { billingReportsService } from '../services/billingReportsService';

export const useBillingReports = (filters = {}) => {
    const [summary, setSummary] = useState(null);
    const [byDay, setByDay] = useState([]);
    const [byMonth, setByMonth] = useState([]);
    const [byCustomer, setByCustomer] = useState([]);
    const [byUser, setByUser] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, dayData, monthData, customerData, userData] = await Promise.all([
                billingReportsService.summary(filters),
                billingReportsService.byDay(filters),
                billingReportsService.byMonth(filters),
                billingReportsService.byCustomer(filters),
                billingReportsService.byUser(filters),
            ]);
            setSummary(summaryData);
            setByDay(dayData);
            setByMonth(monthData);
            setByCustomer(customerData);
            setByUser(userData);
        } catch {
            setError('No se pudieron cargar los reportes de facturación.');
        } finally {
            setIsLoading(false);
        }
    }, [filters.date_after, filters.date_before, filters.user_id]);

    useEffect(() => {
        load();
    }, [load]);

    return { summary, byDay, byMonth, byCustomer, byUser, isLoading, error, reload: load };
};