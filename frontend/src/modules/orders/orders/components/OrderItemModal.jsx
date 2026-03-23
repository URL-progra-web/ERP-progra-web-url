import React, { useEffect, useState } from 'react';
import AppModal from '~/core/components/AppModal';

export const OrderItemModal = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    item,
    statusOptions,
}) => {
    const isEdit = Boolean(item);

    const [formData, setFormData] = useState({
        variant_id: '',
        quantity: 1,
        status_id: '',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (item) {
            setFormData({
                variant_id: item.variant || '',
                quantity: item.quantity || 1,
                status_id: item.status || '',
            });
        } else {
            setFormData({
                variant_id: '',
                quantity: 1,
                status_id: '',
            });
        }
    }, [isOpen, item]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            quantity: Number(formData.quantity),
        };

        if (!isEdit) {
            payload.variant_id = Number(formData.variant_id);
        }

        if (formData.status_id) {
            payload.status_id = Number(formData.status_id);
        }

        const success = await onSubmit(payload, item?.id);
        if (success) onClose();
    };

    const submitDisabled =
        isSubmitting ||
        !formData.quantity ||
        Number(formData.quantity) <= 0 ||
        (!isEdit && !formData.variant_id);

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Editar Item de Pedido' : 'Agregar Item al Pedido'}
            tone="dark"
            size="md"
            onSubmit={handleSubmit}
            submitLabel={isEdit ? 'Guardar Cambios' : 'Agregar Item'}
            submitDisabled={submitDisabled}
        >
            {!isEdit && (
                <div className="mb-3">
                    <label className="form-label">ID de Variant *</label>
                    <input
                        type="number"
                        min="1"
                        className="form-control"
                        name="variant_id"
                        value={formData.variant_id}
                        onChange={handleChange}
                        placeholder="Ej. 123"
                    />
                    <div className="form-text">Por ahora se ingresa el ID del variant directamente.</div>
                </div>
            )}

            <div className="mb-3">
                <label className="form-label">Cantidad *</label>
                <input
                    type="number"
                    min="1"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-0">
                <label className="form-label">Estado del Item</label>
                <select
                    className="form-select"
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleChange}
                >
                    <option value="">(Estado por defecto)</option>
                    {statusOptions.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                </select>
            </div>
        </AppModal>
    );
};
