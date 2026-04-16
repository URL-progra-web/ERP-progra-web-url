import React, { useEffect, useState } from 'react';
import AppModal from '~/core/components/AppModal';

const DEFAULT_FORM = { name: '', description: '' };

export const OrderStatusModal = ({ statusRecord, onSave, onClose }) => {
    const isEditing = Boolean(statusRecord);
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (statusRecord) {
            setForm({
                name: statusRecord.name,
                description: statusRecord.description || '',
            });
        } else {
            setForm(DEFAULT_FORM);
        }
    }, [statusRecord]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (!form.name.trim()) {
            setErrors({ name: 'El nombre es obligatorio.' });
            return;
        }
        onSave(
            {
                name: form.name.trim().toUpperCase(),
                description: form.description?.trim() || null,
            },
            statusRecord?.id
        );
    };

    return (
        <AppModal
            title={isEditing ? 'Editar Estado' : 'Nuevo Estado'}
            tone="dark" accent="var(--bs-orange)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar' : 'Crear estado'}
        >
            <div className="mb-3">
                <label className="form-label fw-semibold" htmlFor="orderStatusNameInput">Nombre *</label>
                <input
                    id="orderStatusNameInput"
                    name="name"
                    type="text"
                    autoComplete="off"
                    className={`form-control text-uppercase ${errors.name ? 'is-invalid' : ''}`}
                    placeholder="SOLICITADO"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={50}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div>
                <label className="form-label" htmlFor="orderStatusDescriptionInput">Descripción</label>
                <textarea
                    id="orderStatusDescriptionInput"
                    name="description"
                    autoComplete="off"
                    className="form-control"
                    rows={3}
                    placeholder="Describe el estado..."
                    value={form.description}
                    onChange={handleChange}
                />
            </div>
        </AppModal>
    );
};
