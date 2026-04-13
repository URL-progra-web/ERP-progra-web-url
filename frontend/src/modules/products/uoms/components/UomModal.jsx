import React, { useState } from 'react';
import AppModal from '~/core/components/AppModal';

export function UomModal({ uom, onClose, onSave }) {
    const [code, setCode] = useState(uom?.code ?? '');
    const [name, setName] = useState(uom?.name ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await onSave({ code, name });
            onClose();
        } catch (err) {
            setError(err?.response?.data?.error || err?.response?.data?.code?.[0] || 'Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppModal
            title={uom ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={saving ? 'Guardando...' : (uom ? 'Guardar cambios' : 'Crear UOM')}
            submitDisabled={saving}
        >
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <div className="mb-3">
                <label className="form-label fw-semibold small" htmlFor="uomCodeInput">Código <span className="text-danger">*</span></label>
                <input
                    id="uomCodeInput"
                    name="uom_code"
                    type="text"
                    autoComplete="off"
                    className="form-control"
                    placeholder="ej: kg, lb, un"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    required
                    maxLength={10}
                />
                <div className="form-text">Máximo 10 caracteres. Se guardará en minúsculas.</div>
            </div>
            <div className="mb-3">
                <label className="form-label fw-semibold small" htmlFor="uomNameInput">Nombre <span className="text-danger">*</span></label>
                <input
                    id="uomNameInput"
                    name="uom_name"
                    type="text"
                    autoComplete="off"
                    className="form-control"
                    placeholder="ej: Kilogramo, Libra, Unidad"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    maxLength={50}
                />
            </div>
        </AppModal>
    );
}
