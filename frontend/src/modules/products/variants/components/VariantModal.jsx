import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const VariantModal = ({ variant, products, colors, sizes, onClose, onSave }) => {
    const isEditing = !!variant;

    const [formData, setFormData] = useState({
        product: '',
        sku: '',
        size: '',
        color: '',
        cost: '',
        price: '',
        is_active: true,
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (variant) {
            setFormData({
                product: variant.product || '',
                sku: variant.sku || '',
                size: variant.size || '',
                color: variant.color || '',
                cost: variant.cost || '',
                price: variant.price || '',
                is_active: variant.is_active ?? true,
            });
        }
    }, [variant]);

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

        if (!formData.product || !formData.sku.trim()) {
            setError('Producto y SKU son obligatorios.');
            return;
        }

        try {
            setIsSubmitting(true);

            const dataToSubmit = {
                product: formData.product,
                sku: formData.sku,
                size: formData.size || null,
                color: formData.color || null,
                cost: formData.cost,
                price: formData.price,
                is_active: formData.is_active,
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
            title={isEditing ? 'Editar Variante' : 'Nueva Variante'}
            tone="dark"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <form onSubmit={handleSubmit} id="variantForm">
                <div className="mb-3">
                    <label className="form-label fw-semibold">Producto *</label>
                    <select
                        name="product"
                        className="form-select"
                        value={formData.product}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona un producto</option>
                        {products.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <div className="form-text">
                        La unidad base y el stock se gestionan desde el producto y el kardex, no desde la variante.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">SKU *</label>
                    <input
                        type="text"
                        name="sku"
                        className="form-control"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="Ej. CAM-ROJ-M"
                    />
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Color</label>
                        <select
                            name="color"
                            className="form-select"
                            value={formData.color}
                            onChange={handleChange}
                        >
                            <option value="">Sin color</option>
                            {colors.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Talla</label>
                        <select
                            name="size"
                            className="form-select"
                            value={formData.size}
                            onChange={handleChange}
                        >
                            <option value="">Sin talla</option>
                            {sizes.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Costo *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="cost"
                            className="form-control"
                            value={formData.cost}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Precio *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            className="form-control"
                            value={formData.price}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-check form-switch mt-3">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        name="is_active"
                        id="variantActiveSwitch"
                        checked={formData.is_active}
                        onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="variantActiveSwitch">
                        Variante activa
                    </label>
                </div>
            </form>
        </AppModal>
    );
};

export default VariantModal;
