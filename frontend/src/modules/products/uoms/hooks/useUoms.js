import { useState, useEffect, useCallback } from 'react';
import { uomService } from '../services/uomService';

export function useUoms() {
    const [uoms, setUoms] = useState([]);
    const [uomCount, setUomCount] = useState(0);
    const [uomNumPages, setUomNumPages] = useState(1);
    const [uomPage, setUomPage] = useState(1);

    const [conversions, setConversions] = useState([]);
    const [convCount, setConvCount] = useState(0);
    const [convNumPages, setConvNumPages] = useState(1);
    const [convPage, setConvPage] = useState(1);

    const [fromUomFilter, setFromUomFilter] = useState('');
    const [toUomFilter, setToUomFilter] = useState('');
    const [isLoadingUoms, setIsLoadingUoms] = useState(true);
    const [isLoadingConversions, setIsLoadingConversions] = useState(true);
    const [error, setError] = useState(null);

    // ── UOMs ──────────────────────────────────────────────────
    const fetchUoms = useCallback(async () => {
        try {
            setIsLoadingUoms(true);
            const data = await uomService.getUoms({ page: uomPage });
            setUoms(data.results);
            setUomCount(data.count);
            setUomNumPages(data.num_pages);
            setError(null);
        } catch (e) {
            setError('Error al cargar unidades de medida.');
        } finally {
            setIsLoadingUoms(false);
        }
    }, [uomPage]);

    useEffect(() => { fetchUoms(); }, [fetchUoms]);

    const createUom = async (data) => {
        await uomService.createUom(data);
        fetchUoms();
    };

    const updateUom = async (id, data) => {
        await uomService.updateUom(id, data);
        fetchUoms();
    };

    const deleteUom = async (id) => {
        try {
            await uomService.deleteUom(id);
            fetchUoms();
            return null;
        } catch (e) {
            const msg = e?.response?.data?.error || 'Error al eliminar la UOM.';
            return msg;
        }
    };

    // ── Conversions ───────────────────────────────────────────
    const fetchConversions = useCallback(async () => {
        try {
            setIsLoadingConversions(true);
            const data = await uomService.getConversions({
                from_uom_id: fromUomFilter || undefined,
                to_uom_id: toUomFilter || undefined,
                page: convPage,
            });
            setConversions(data.results);
            setConvCount(data.count);
            setConvNumPages(data.num_pages);
            setError(null);
        } catch (e) {
            setError('Error al cargar conversiones.');
        } finally {
            setIsLoadingConversions(false);
        }
    }, [fromUomFilter, toUomFilter, convPage]);

    useEffect(() => { fetchConversions(); }, [fetchConversions]);

    const createConversion = async (data) => {
        await uomService.createConversion(data);
        fetchConversions();
    };

    const updateConversion = async (id, data) => {
        await uomService.updateConversion(id, data);
        fetchConversions();
    };

    const deleteConversion = async (id) => {
        try {
            await uomService.deleteConversion(id);
            fetchConversions();
            return null;
        } catch (e) {
            const msg = e?.response?.data?.error || 'Error al eliminar la conversión.';
            return msg;
        }
    };

    return {
        // UOMs
        uoms, uomCount, uomNumPages, uomPage, setUomPage,
        isLoadingUoms, createUom, updateUom, deleteUom,
        // Conversions
        conversions, convCount, convNumPages, convPage, setConvPage,
        isLoadingConversions, createConversion, updateConversion, deleteConversion,
        fromUomFilter, setFromUomFilter,
        toUomFilter, setToUomFilter,
        // Shared
        error, setError,
    };
}
