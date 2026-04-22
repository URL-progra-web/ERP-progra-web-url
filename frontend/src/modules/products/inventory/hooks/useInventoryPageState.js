import { useState, useCallback } from 'react';

export function useInventoryPageState({
    createTransactionType,
    updateTransactionType,
    deleteTransactionType,
    createAdjustment,
    setError,
}) {
    const [activeTab, setActiveTab] = useState('adjustments');
    const [typeModal, setTypeModal] = useState(null);
    const [alertConfig, setAlertConfig] = useState(null);

    const showAlert = useCallback((type, header, content, onConfirm = null) => {
        setAlertConfig({ type, header, content, onConfirm });
    }, []);

    const closeAlert = useCallback(() => {
        setAlertConfig(null);
    }, []);

    const handleSaveType = useCallback(async (data) => {
        try {
            if (typeModal && typeModal !== 'new') {
                await updateTransactionType(typeModal.name, data);
                showAlert('success', 'Tipo actualizado', 'El tipo de transacción se actualizó correctamente.');
            } else {
                await createTransactionType(data);
                showAlert('success', 'Tipo creado', 'El tipo de transacción se creó correctamente.');
            }
            setTypeModal(null);
        } catch (err) {
            const message = err?.response?.data?.error || 'No se pudo guardar el tipo de transacción.';
            showAlert('danger', 'Error', message);
        }
    }, [typeModal, createTransactionType, updateTransactionType, showAlert]);

    const handleDeleteType = useCallback(async (name) => {
        setAlertConfig({
            type: 'danger',
            header: '¿Eliminar este tipo de transacción?',
            content: `Se eliminará "${name}". Esta acción no se puede deshacer.`,
            confirmLabel: 'Sí, eliminar',
            onConfirm: async () => {
                try {
                    await deleteTransactionType(name);
                    showAlert('success', 'Tipo eliminado', 'El tipo de transacción se eliminó correctamente.');
                } catch (err) {
                    const message = err?.response?.data?.error || 'No se pudo eliminar el tipo de transacción.';
                    showAlert('danger', 'Error', message);
                }
                setTypeModal(null);
            },
        });
    }, [deleteTransactionType, showAlert]);

    const handleSaveAdjustment = useCallback(async (data) => {
        try {
            await createAdjustment(data);
            showAlert('success', 'Ajuste registrado', 'El ajuste de inventario se ha registrado correctamente.');
        } catch (err) {
            const message = err?.response?.data?.error || 'No se pudo registrar el ajuste de inventario.';
            showAlert('danger', 'Error', message);
        }
    }, [createAdjustment, showAlert]);

    return {
        activeTab,
        setActiveTab,
        typeModal,
        setTypeModal,
        alertConfig,
        closeAlert,
        handleSaveType,
        handleDeleteType,
        handleSaveAdjustment,
        showAlert,
    };
}
