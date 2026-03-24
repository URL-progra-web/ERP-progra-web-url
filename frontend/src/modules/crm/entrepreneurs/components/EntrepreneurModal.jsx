import React, { useEffect, useState } from 'react';
import AppModal from '~/core/components/AppModal';

const DEFAULT_FORM = {
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    user_id: '',
};

export const EntrepreneurModal = ({ entrepreneur, users, onSave, onClose }) => {
    const [form, setForm] = useState(DEFAULT_FORM);
    const [errors, setErrors] = useState({});
    const isEditing = Boolean(entrepreneur);

    useEffect(() => {
        if (entrepreneur) {
            setForm({
                company_name: entrepreneur.company_name,
                contact_name: entrepreneur.contact_name,
                phone: entrepreneur.phone || '',
                email: entrepreneur.email || '',
                user_id: entrepreneur.user?.id || '',
            });
        } else {
            setForm(DEFAULT_FORM);
        }
    }, [entrepreneur]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const nextErrors = {};
        if (!form.company_name.trim()) nextErrors.company_name = 'El nombre de la empresa es obligatorio';
        if (!form.contact_name.trim()) nextErrors.contact_name = 'El nombre del contacto es obligatorio';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Correo inválido';
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        if (!validate()) return;
        onSave(
            {
                company_name: form.company_name.trim(),
                contact_name: form.contact_name.trim(),
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                user_id: form.user_id ? parseInt(form.user_id) : null,
            },
            entrepreneur?.id
        );
    };

    return (
        <AppModal
            title={isEditing ? 'Editar emprendedor' : 'Nuevo emprendedor'}
            tone="dark"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear emprendedor'}
        >
            <div className="mb-3">
                <label className="form-label">Nombre de la empresa *</label>
                <input
                    type="text"
                    className={`form-control ${errors.company_name ? 'is-invalid' : ''}`}
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Ej: Tech Solutions S.A."
                />
                {errors.company_name && <div className="invalid-feedback">{errors.company_name}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Nombre del contacto *</label>
                <input
                    type="text"
                    className={`form-control ${errors.contact_name ? 'is-invalid' : ''}`}
                    name="contact_name"
                    value={form.contact_name}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                />
                {errors.contact_name && <div className="invalid-feedback">{errors.contact_name}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                    type="text"
                    className="form-control"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Ej: +593 99 123 4567"
                />
            </div>
            <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Ej: contacto@empresa.com"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="mb-3">
                <label className="form-label">Usuario asignado</label>
                <select
                    className="form-select"
                    name="user_id"
                    value={form.user_id}
                    onChange={handleChange}
                >
                    <option value="">Sin asignar</option>
                    {users.map((user) => (
                        <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                        </option>
                    ))}
                </select>
                <small className="form-text text-muted">
                    Opcional: Asigna un usuario responsable de este emprendedor
                </small>
            </div>
        </AppModal>
    );
};
