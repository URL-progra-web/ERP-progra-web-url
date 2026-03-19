import React, { useState } from 'react';

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
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">
                            {uom ? 'Editar Unidad de Medida' : 'Nueva Unidad de Medida'}
                        </h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">Código <span className="text-danger">*</span></label>
                                <input
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
                                <label className="form-label fw-semibold small">Nombre <span className="text-danger">*</span></label>
                                <input
                                    className="form-control"
                                    placeholder="ej: Kilogramo, Libra, Unidad"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    required
                                    maxLength={50}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                                {saving ? 'Guardando...' : (uom ? 'Guardar cambios' : 'Crear UOM')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
