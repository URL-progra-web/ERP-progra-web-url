import React, { useEffect, useState } from 'react';
import AppModal from '~/core/components/AppModal';

const DEFAULT_FORM = {
    name: '',
    is_active: true,
};

export const PaymentMethodModal = ({ method, onSave, onClose }) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});
    const isEditing = Boolean(method);

    useEffect(() => {
        if (method) {
            setForm({
                name: method.name,
                is_active: method.is_active,
            });
        } else {
            setForm(DEFAULT_FORM);
        }
    }, [method]);

    const handleChange = (evt) => {
        const { name, value, type, checked } = evt.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = 'El nombre es obligatorio';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (!validate()) return;
        onSave(
            {
                name: form.name.trim(),
                is_active: form.is_active,
            },
            method?.id
        );
    };

    return (
        <AppModal
            title={isEditing ? 'Editar método de pago' : 'Nuevo método de pago'}
            tone="dark" accent="var(--bs-orange)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear método'}
        >
            <div className="mb-3">
                <label className="form-label">Nombre del Método *</label>
                <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isEditing && method?.is_protected}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                {isEditing && method?.is_protected && (
                    <small className="text-muted mt-1 d-block">No se puede renombrar un método protegido por el sistema.</small>
                )}
            </div>
            
            <div className="form-check form-switch mt-4 bg-body-tertiary p-3 rounded-3 d-flex justify-content-between align-items-center">
                <label className="form-check-label mb-0 fw-semibold" htmlFor="isActiveSwitch">
                    {form.is_active ? 'Método Activo' : 'Método Inactivo'}
                    <small className="d-block text-muted fw-normal">
                        {form.is_active ? 'Estará disponible para nuevas órdenes' : 'No se podrá seleccionar en nuevas órdenes'}
                    </small>
                </label>
                <input
                    className="form-check-input ms-0 fs-4"
                    type="checkbox"
                    role="switch"
                    id="isActiveSwitch"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                />
            </div>
        </AppModal>
    );
};
