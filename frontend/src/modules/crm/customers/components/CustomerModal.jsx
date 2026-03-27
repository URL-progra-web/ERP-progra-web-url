import React, { useEffect, useState } from 'react';
import AppModal from '~/core/components/AppModal';

const DEFAULT_FORM = {
    name: '',
    phone: '',
    email: '',
    address: '',
    customer_type: 'RETAIL',
};

export const CustomerModal = ({ customer, onSave, onClose }) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});
    const isEditing = Boolean(customer);

    useEffect(() => {
        if (customer) {
            setForm({
                name: customer.name,
                phone: customer.phone,
                email: customer.email || '',
                address: customer.address || '',
                customer_type: customer.customer_type || 'RETAIL',
            });
        } else {
            setForm(DEFAULT_FORM);
        }
    }, [customer]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = 'El nombre es obligatorio';
        if (!form.phone.trim()) nextErrors.phone = 'El teléfono es obligatorio';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Correo inválido';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (!validate()) return;
        onSave(
            {
                name: form.name.trim(),
                phone: form.phone.trim(),
                email: form.email.trim() || null,
                address: form.address.trim() || null,
                customer_type: form.customer_type,
            },
            customer?.id
        );
    };

    return (
        <AppModal
            title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
            tone="dark" accent="var(--bs-success)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear cliente'}
        >
            <div className="mb-3">
                <label className="form-label">Nombre *</label>
                <input
                    type="text"
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Teléfono *</label>
                <input
                    type="text"
                    className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Correo</label>
                <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div>
                <label className="form-label">Dirección</label>
                <textarea
                    className="form-control"
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                />
            </div>
            <div className="mb-3 mt-3">
                <label className="form-label">Tipo de cliente *</label>
                <select
                    className="form-select"
                    name="customer_type"
                    value={form.customer_type}
                    onChange={handleChange}
                >
                    <option value="RETAIL">Minorista</option>
                    <option value="WHOLESALE">Mayorista</option>
                </select>
            </div>
        </AppModal>
    );
};
