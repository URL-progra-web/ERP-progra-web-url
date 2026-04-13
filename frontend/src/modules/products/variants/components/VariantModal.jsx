import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const emptyForm = {
    product: '',
    sku: '',
    size: '',
    color: '',
    cost: '',
    price: '',
    image: null,
    remove_image: false,
    is_active: true,
};

const VariantModal = ({ variant, products, colors, sizes, onClose, onSave }) => {
    const isEditing = !!variant;

    const [formData, setFormData] = useState(emptyForm);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (variant) {
            setFormData({
                product: variant.product || '',
                sku: variant.sku || '',
                size: variant.size || '',
                color: variant.color || '',
                cost: variant.cost || '',
                price: variant.price || '',
                image: null,
                remove_image: false,
                is_active: variant.is_active ?? true,
            });
            setPreviewUrl(variant.image_url || '');
            return;
        }

        setFormData(emptyForm);
        setPreviewUrl('');
    }, [variant]);

    useEffect(() => () => {
        if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
    }, [previewUrl]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            const file = files?.[0] || null;
            setFormData(prev => ({
                ...prev,
                image: file,
                remove_image: false,
            }));

            setPreviewUrl((currentUrl) => {
                if (currentUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(currentUrl);
                }
                return file ? URL.createObjectURL(file) : (variant?.image_url || '');
            });
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleRemoveImageChange = (e) => {
        const shouldRemove = e.target.checked;

        setFormData(prev => ({
            ...prev,
            image: null,
            remove_image: shouldRemove,
        }));

        setPreviewUrl((currentUrl) => {
            if (currentUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentUrl);
            }
            return shouldRemove ? '' : (variant?.image_url || '');
        });
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
                image: formData.image,
                remove_image: formData.remove_image,
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
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Guardar'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <div>
                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="variantProductSelect">Producto *</label>
                    <select
                        id="variantProductSelect"
                        name="product"
                        autoComplete="off"
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
                    <label className="form-label fw-semibold" htmlFor="variantSkuInput">SKU *</label>
                    <input
                        id="variantSkuInput"
                        type="text"
                        name="sku"
                        autoComplete="off"
                        className="form-control"
                        value={formData.sku}
                        onChange={handleChange}
                        placeholder="Ej. CAM-ROJ-M"
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="variantImageInput">Imagen de la variante</label>
                    <input
                        id="variantImageInput"
                        type="file"
                        name="image"
                        autoComplete="off"
                        className="form-control"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    <div className="form-text">
                        Sube una foto específica para esta talla o color.
                    </div>
                </div>

                {previewUrl && (
                    <div className="mb-3">
                        <div className="small text-muted mb-2">Vista previa</div>
                        <img
                            src={previewUrl}
                            alt="Vista previa de la variante"
                            className="rounded-3 border"
                            style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                        />
                    </div>
                )}

                {isEditing && variant?.image_url && (
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="removeVariantImage"
                            checked={formData.remove_image}
                            onChange={handleRemoveImageChange}
                        />
                        <label className="form-check-label" htmlFor="removeVariantImage">
                            Quitar imagen actual
                        </label>
                    </div>
                )}

                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold" htmlFor="variantColorSelect">Color</label>
                        <select
                            id="variantColorSelect"
                            name="color"
                            autoComplete="off"
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
                        <label className="form-label fw-semibold" htmlFor="variantSizeSelect">Talla</label>
                        <select
                            id="variantSizeSelect"
                            name="size"
                            autoComplete="off"
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
                        <label className="form-label fw-semibold" htmlFor="variantCostInput">Costo *</label>
                        <input
                            id="variantCostInput"
                            type="number"
                            step="0.01"
                            min="0"
                            name="cost"
                            autoComplete="off"
                            className="form-control"
                            value={formData.cost}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold" htmlFor="variantPriceInput">Precio *</label>
                        <input
                            id="variantPriceInput"
                            type="number"
                            step="0.01"
                            min="0"
                            name="price"
                            autoComplete="off"
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
            </div>
        </AppModal>
    );
};

export default VariantModal;
