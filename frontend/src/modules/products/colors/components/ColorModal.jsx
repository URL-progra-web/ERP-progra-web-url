import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const getColorCode = (color) =>
    color?.code || color?.hex_code || color?.color_code || color?.codigo || '';

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('El nombre es obligatorio.');
            return;
        }

        try {
            setIsSubmitting(true);

            const dataToSubmit = {
                name: formData.name,
                code: formData.code || null,
                hex_code: formData.code || null,
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

    return (
        <AppModal
            title={isEditing ? 'Editar Color' : 'Nuevo Color'}
            tone="dark"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <form onSubmit={handleSubmit} id="colorForm">
                <div className="mb-3">
                    <label className="form-label fw-semibold">Nombre del color *</label>
                    <input
                        type="text"
                        name="name"
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
                    <label className="form-label fw-semibold">Código del color</label>
                    <input
                        type="text"
                        name="code"
                        className="form-control"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Ej. #FF0000"
                    />
                    <div className="form-text">
                        Puedes ingresar un código HEX para mostrar una vista previa del color.
                    </div>
                </div>

                {formData.code && (
                    <div className="mb-3">
                        <label className="form-label fw-semibold">Vista previa</label>
                        <div>
                            <span
                                className="d-inline-block rounded border"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    backgroundColor: formData.code,
                                }}
                                title={formData.code}
                            />
                        </div>
                    </div>
                )}
            </form>
        </AppModal>
    );
};

export default ColorModal;