import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const getColorCode = (color) =>
    color?.code || color?.hex_code || color?.color_code || color?.codigo || '';

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6})$/;

const normalizeHexColor = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    return trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`;
};

const ColorModal = ({ color, onClose, onSave }) => {
    const isEditing = !!color;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (color) {
            setFormData({
                name: color.name || '',
                code: getColorCode(color),
            });
        }
    }, [color]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePickerChange = (e) => {
        setFormData(prev => ({
            ...prev,
            code: e.target.value.toUpperCase(),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }

        const normalizedCode = normalizeHexColor(formData.code);
        if (normalizedCode && !HEX_COLOR_REGEX.test(normalizedCode)) {
            setError('El código del color debe estar en formato HEX de 6 caracteres, por ejemplo #FF0000.');
            return;
        }

        try {
            setIsSubmitting(true);

            const dataToSubmit = {
                name: formData.name,
                code: normalizedCode || null,
                hex_code: normalizedCode || null,
            };

            await onSave(dataToSubmit);
        } catch (err) {
            const detail = err.response?.data;
            if (detail && typeof detail === 'object') {
                const messages = Object.values(detail).flat().join(' ');
                setError(messages || 'Error al procesar la solicitud.');
            } else {
                setError('Error al procesar la solicitud.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const normalizedCode = normalizeHexColor(formData.code);
    const hasValidColor = HEX_COLOR_REGEX.test(normalizedCode);
    const pickerValue = hasValidColor ? normalizedCode : '#1F2937';

    return (
        <AppModal
            title={isEditing ? 'Editar Color' : 'Nuevo Color'}
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <div>
                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="colorNameInput">Nombre del color *</label>
                    <input
                        id="colorNameInput"
                        type="text"
                        name="name"
                        autoComplete="off"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Rojo, Azul, Negro..."
                    />
                    <div className="form-text">
                        Usa un nombre claro para identificar este color.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="colorCodeInput">Código del color</label>
                    <div className="d-flex align-items-stretch gap-3">
                        <input
                            id="colorPickerInput"
                            type="color"
                            className="form-control form-control-color flex-shrink-0"
                            value={pickerValue}
                            onChange={handlePickerChange}
                            aria-label="Seleccionar color"
                            title="Seleccionar color"
                            style={{ width: '56px', minWidth: '56px', height: '48px' }}
                        />
                        <input
                            id="colorCodeInput"
                            type="text"
                            name="code"
                            autoComplete="off"
                            className="form-control"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="Ej. #FF0000"
                        />
                    </div>
                    <div className="form-text">
                        Puedes elegir el color visualmente o ajustar el HEX manualmente.
                    </div>
                </div>

            </div>
        </AppModal>
    );
};

export default ColorModal;
