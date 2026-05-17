import React, { useState } from 'react';
import AppModal from '~/core/components/AppModal';
import { AppSelect } from '~/core/components';

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
        <AppModal
            title={conversion ? 'Editar Conversión' : 'Nueva Conversión'}
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={saving ? 'Guardando...' : (conversion ? 'Guardar cambios' : 'Crear conversión')}
            submitDisabled={saving}
        >
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <div className="mb-3">
                <label className="form-label fw-semibold small" htmlFor="conversionFromUomSelect">UOM Origen <span className="text-danger">*</span></label>
                <AppSelect
                    id="conversionFromUomSelect"
                    name="conversion_from_uom"
                    value={fromUomId}
                    onChange={setFromUomId}
                    options={[
                        { value: '', label: 'Seleccionar...' },
                        ...uoms.map(u => ({ value: u.id, label: `${u.name} (${u.code})` })),
                    ]}
                />
            </div>
            <div className="mb-3">
                <label className="form-label fw-semibold small" htmlFor="conversionToUomSelect">UOM Destino <span className="text-danger">*</span></label>
                <AppSelect
                    id="conversionToUomSelect"
                    name="conversion_to_uom"
                    value={toUomId}
                    onChange={setToUomId}
                    options={[
                        { value: '', label: 'Seleccionar...' },
                        ...uoms.map(u => ({ value: u.id, label: `${u.name} (${u.code})` })),
                    ]}
                />
            </div>
            <div className="mb-3">
                <label className="form-label fw-semibold small" htmlFor="conversionMultiplierInput">Multiplicador <span className="text-danger">*</span></label>
                <input
                    id="conversionMultiplierInput"
                    type="number"
                    name="conversion_multiplier"
                    autoComplete="off"
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
        </AppModal>
    );
}
