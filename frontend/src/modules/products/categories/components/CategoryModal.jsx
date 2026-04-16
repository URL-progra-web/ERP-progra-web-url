import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';
import CategoryCascadeSelector from './CategoryCascadeSelector';

const CategoryModal = ({ category, categories, onClose, onSave }) => {
    const isEditing = !!category;

    const [formData, setFormData] = useState({
        name: '',
        parent: '',
        is_leaf: false,
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                parent: category.parent || '',
                is_leaf: category.is_leaf || false,
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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
                parent: formData.parent || null,
                is_leaf: formData.is_leaf,
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
            title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <div>
                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="categoryNameInput">Nombre de la categoría *</label>
                    <input
                        type="text"
                        id="categoryNameInput"
                        name="name"
                        autoComplete="off"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Frutas, Verduras, Lácteos..."
                    />
                    <div className="form-text">Dale un nombre claro para identificar este grupo de productos.</div>
                </div>

                <div className="mb-3">
                    <div className="form-label fw-semibold">Pertenece a</div>
                    <CategoryCascadeSelector
                        categories={categories}
                        value={formData.parent}
                        onChange={(newParentId) => setFormData(prev => ({ ...prev, parent: newParentId }))}
                        disabled={isSubmitting}
                        excludeIds={category?.id ? [category.id] : []}
                    />
                    <div className="form-text">
                        Si esta categoría es parte de otra, selecciónala aquí.
                        Ej: "Cítricos" pertenece a "Frutas".
                    </div>
                </div>

                <div className="form-check form-switch mb-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="is_leaf"
                        id="isLeafSwitch"
                        checked={formData.is_leaf}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="isLeafSwitch">
                        Se pueden asignar productos a esta categoría
                    </label>
                    <div className="form-text">
                        Activa esto si los productos se clasifican directamente aquí.
                        Desactívalo si solo agrupa otras subcategorías.
                    </div>
                </div>
            </div>
        </AppModal>
    );
};

export default CategoryModal;
