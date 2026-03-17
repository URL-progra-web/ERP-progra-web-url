import { useState } from 'react';

/**
 * Manages all UI state for UomsPage:
 *   - active tab
 *   - UOM modal open/edit state
 *   - Conversion modal open/edit state
 *   - AppAlert confirmation dialog
 *
 * Receives the CRUD actions from useUoms so it can wire up the
 * confirmation handlers without the page component having to do it.
 */
export function useUomPageState({ createUom, updateUom, deleteUom, createConversion, updateConversion, deleteConversion, setError }) {
    const [activeTab, setActiveTab] = useState('uoms');
    const [uomModal, setUomModal] = useState(null);   // null | 'new' | UomObject
    const [convModal, setConvModal] = useState(null); // null | 'new' | ConversionObject
    const [alertConfig, setAlertConfig] = useState(null);

    const closeAlert = () => setAlertConfig(null);

    // ── UOM handlers ──────────────────────────────────────────
    const handleSaveUom = async (data) => {
        if (uomModal === 'new') {
            await createUom(data);
        } else {
            await updateUom(uomModal.id, data);
        }
    };

    const handleDeleteUom = (uom) => {
        setAlertConfig({
            type: 'danger',
            header: 'Eliminar Unidad de Medida',
            content: `¿Estás seguro de eliminar "${uom.name} (${uom.code})"? Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                closeAlert();
                const err = await deleteUom(uom.id);
                if (err) {
                    setAlertConfig({
                        type: 'warning',
                        header: 'No se puede eliminar',
                        content: err,
                    });
                }
            },
        });
    };

    // ── Conversion handlers ────────────────────────────────────
    const handleSaveConversion = async (data) => {
        if (convModal === 'new') {
            await createConversion(data);
        } else {
            await updateConversion(convModal.id, data);
        }
    };

    const handleDeleteConversion = (conv) => {
        setAlertConfig({
            type: 'danger',
            header: 'Eliminar Conversión',
            content: `¿Estás seguro de eliminar la conversión ${conv.from_uom_code} → ${conv.to_uom_code}?`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                closeAlert();
                const err = await deleteConversion(conv.id);
                if (err) {
                    setAlertConfig({
                        type: 'warning',
                        header: 'No se puede eliminar',
                        content: err,
                    });
                }
            },
        });
    };

    return {
        // Tab
        activeTab, setActiveTab,
        // Modals
        uomModal, setUomModal,
        convModal, setConvModal,
        // Alert
        alertConfig, closeAlert,
        // Handlers
        handleSaveUom, handleDeleteUom,
        handleSaveConversion, handleDeleteConversion,
    };
}
