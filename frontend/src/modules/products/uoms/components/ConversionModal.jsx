import React, { useState } from 'react';

export function ConversionModal({ conversion, uoms, onClose, onSave }) {
    const [fromUomId, setFromUomId] = useState(conversion?.from_uom_id?.toString() ?? '');
    const [toUomId, setToUomId] = useState(conversion?.to_uom_id?.toString() ?? '');
    const [multiplier, setMultiplier] = useState(conversion?.multiplier?.toString() ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (fromUomId === toUomId && parseFloat(multiplier) !== 1) {
            setError('Si las unidades son iguales, el multiplicador debe ser 1.');
            return;
        }

        setSaving(true);
        setError(null);
        try {
            await onSave({
                from_uom_id: parseInt(fromUomId),
                to_uom_id: parseInt(toUomId),
                multiplier: parseFloat(multiplier),
            });
            onClose();
        } catch (err) {
            setError(err?.response?.data?.error || 'Error al guardar la conversión.');
        } finally {
            setSaving(false);
        }
    };

    const fromCode = uoms.find(u => u.id.toString() === fromUomId)?.code || 'origen';
    const toCode   = uoms.find(u => u.id.toString() === toUomId)?.code  || 'destino';

    return (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title fw-bold">
                            {conversion ? 'Editar Conversión' : 'Nueva Conversión'}
                        </h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">UOM Origen <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    value={fromUomId}
                                    onChange={e => setFromUomId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {uoms.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">UOM Destino <span className="text-danger">*</span></label>
                                <select
                                    className="form-select"
                                    value={toUomId}
                                    onChange={e => setToUomId(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {uoms.map(u => (
                                        <option key={u.id} value={u.id}>{u.name} ({u.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label fw-semibold small">Multiplicador <span className="text-danger">*</span></label>
                                <input
                                    type="number"
                                    step="0.0001"
                                    min="0.0001"
                                    className="form-control"
                                    placeholder="ej: 0.4536"
                                    value={multiplier}
                                    onChange={e => setMultiplier(e.target.value)}
                                    required
                                />
                                <div className="form-text">
                                    1 {fromCode} = {multiplier || '?'} {toCode}
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-light" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn btn-primary fw-semibold" disabled={saving}>
                                {saving ? 'Guardando...' : (conversion ? 'Guardar cambios' : 'Crear conversión')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
