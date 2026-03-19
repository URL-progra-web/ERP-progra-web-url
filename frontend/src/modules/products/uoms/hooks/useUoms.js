import { useState, useEffect, useCallback } from 'react';
import { uomService } from '../services/uomService';

export function useUoms() {
    const [uoms, setUoms] = useState([]);
    const [conversions, setConversions] = useState([]);
    const [fromUomFilter, setFromUomFilter] = useState('');
    const [toUomFilter, setToUomFilter] = useState('');
    const [isLoadingUoms, setIsLoadingUoms] = useState(true);
    const [isLoadingConversions, setIsLoadingConversions] = useState(true);
    const [error, setError] = useState(null);

    // ── UOMs ──────────────────────────────────────────────────
    const fetchUoms = useCallback(async () => {
        try {
            setIsLoadingUoms(true);
            const data = await uomService.getUoms();
            setUoms(data);
            setError(null);
        } catch (e) {
            setError('Error al cargar unidades de medida.');
        } finally {
            setIsLoadingUoms(false);
        }
    }, []);

    useEffect(() => { fetchUoms(); }, [fetchUoms]);

    const createUom = async (data) => {
        await uomService.createUom(data);
        fetchUoms();
    };

    const updateUom = async (id, data) => {
        await uomService.updateUom(id, data);
        fetchUoms();
    };

    // Returns an error string if failed, null if ok
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
            });
            setConversions(data);
            setError(null);
        } catch (e) {
            setError('Error al cargar conversiones.');
        } finally {
            setIsLoadingConversions(false);
        }
    }, [fromUomFilter, toUomFilter]);

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
        uoms, isLoadingUoms, createUom, updateUom, deleteUom,
        // Conversions
        conversions, isLoadingConversions,
        fromUomFilter, setFromUomFilter,
        toUomFilter, setToUomFilter,
        createConversion, updateConversion, deleteConversion,
        // Shared
        error, setError,
    };
}
