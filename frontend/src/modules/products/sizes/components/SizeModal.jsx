import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const SizeModal = ({ size, onClose, onSave }) => {
    const isEditing = !!size;

    const [formData, setFormData] = useState({
        name: '',
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (size) {
            setFormData({
                name: size.name || '',
            });
        }
    }, [size]);

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
            title={isEditing ? 'Editar Talla' : 'Nueva Talla'}
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <form onSubmit={handleSubmit} id="sizeForm">
                <div className="mb-3">
                    <label className="form-label fw-semibold">Nombre de la talla *</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. S, M, L, XL..."
                    />
                    <div className="form-text">
                        Usa un nombre claro para identificar esta talla.
                    </div>
                </div>
            </form>
        </AppModal>
    );
};

export default SizeModal;