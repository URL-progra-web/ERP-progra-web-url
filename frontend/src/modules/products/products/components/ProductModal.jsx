import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';
import { AppSelect, RecursiveHierarchySelector } from '~/core/components';

const emptyForm = {
    name: '',
    description: '',
    category: '',
    entrepreneur: '',
    business_unit: '',
    base_uom: '',
    image: null,
    remove_image: false,
};

const ProductModal = ({ product, categories, entrepreneurs, businessUnits, uoms, onClose, onSave }) => {
    const isEditing = !!product;

    const [formData, setFormData] = useState(emptyForm);

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                entrepreneur: product.entrepreneur || '',
                business_unit: product.business_unit || '',
                base_uom: product.base_uom || '',
                image: null,
                remove_image: false,
            });
            setPreviewUrl(product.image_url || '');
            return;
        }

        setFormData(emptyForm);
        setPreviewUrl('');
    }, [product]);

    useEffect(() => () => {
        if (previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
    }, [previewUrl]);

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;

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
                return file ? URL.createObjectURL(file) : (product?.image_url || '');
            });
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
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
            return shouldRemove ? '' : (product?.image_url || '');
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim()) {
            setError('El nombre del producto es obligatorio.');
            return;
        }

        if (!formData.entrepreneur) {
            setError('Debes seleccionar un emprendedor.');
            return;
        }

        if (!formData.business_unit) {
            setError('Debes seleccionar una sede o punto de venta.');
            return;
        }

        if (!formData.base_uom) {
            setError('Debes seleccionar una unidad base para el producto.');
            return;
        }

        try {
            setIsSubmitting(true);
            const dataToSubmit = {
                name: formData.name,
                description: formData.description || '',
                category: formData.category || null,
                entrepreneur: formData.entrepreneur,
                business_unit: formData.business_unit,
                base_uom: formData.base_uom,
                image: formData.image,
                remove_image: formData.remove_image,
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
            title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            tone="dark" accent="var(--bs-primary)"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={isEditing ? 'Guardar cambios' : 'Crear producto'}
            submitDisabled={isSubmitting}
        >
            {error && <div className="alert alert-danger small py-2">{error}</div>}

            <div>
                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productNameInput">Nombre del producto *</label>
                    <input
                        id="productNameInput"
                        type="text"
                        name="name"
                        autoComplete="off"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej. Aguacate, Camiseta, Café..."
                    />
                    <div className="form-text">
                        Nombre general del producto. Las presentaciones (tamaño, color, etc.) se manejan desde variantes.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productDescriptionInput">Descripción</label>
                    <textarea
                        id="productDescriptionInput"
                        name="description"
                        className="form-control"
                        rows="2"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Breve descripción del producto..."
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productImageInput">Imagen del producto</label>
                    <input
                        id="productImageInput"
                        type="file"
                        name="image"
                        autoComplete="off"
                        className="form-control"
                        accept="image/*"
                        onChange={handleChange}
                    />
                    <div className="form-text">
                        Foto principal del producto. Las variantes pueden tener su propia imagen aparte.
                    </div>
                </div>

                {previewUrl && (
                    <div className="mb-3">
                        <div className="small text-muted mb-2">Vista previa</div>
                        <img
                            src={previewUrl}
                            alt="Vista previa del producto"
                            className="rounded-3 border"
                            style={{ width: '96px', height: '96px', objectFit: 'cover' }}
                        />
                    </div>
                )}

                {isEditing && product?.image_url && (
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="removeProductImage"
                            checked={formData.remove_image}
                            onChange={handleRemoveImageChange}
                        />
                        <label className="form-check-label" htmlFor="removeProductImage">
                            Quitar imagen actual
                        </label>
                    </div>
                )}

                <div className="mb-3">
                    <div className="form-label fw-semibold" id="productCategoryLabel">Categoría</div>
                    <RecursiveHierarchySelector
                        items={categories}
                        value={formData.category}
                        onChange={(categoryId) => setFormData((prev) => ({ ...prev, category: categoryId }))}
                        disabled={isSubmitting}
                        getId={(item) => item?.id}
                        getParentId={(item) => item?.parent}
                        getLabel={(item) => item?.name}
                        rootOptionLabel="Sin categoría"
                        levelRootLabel="Selecciona la categoría"
                        levelChildLabel={(parentName) => `Subcategorías de "${parentName || 'Categoría'}"`}
                        selectionMode="any"
                    />
                    <div className="form-text">
                        Grupo al que pertenece este producto (ej. Frutas, Ropa, Bebidas).
                    </div>
                </div>

                <hr className="my-3" />

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productEntrepreneurSelect">Emprendedor / Proveedor *</label>
                    <AppSelect
                        id="productEntrepreneurSelect"
                        name="entrepreneur"
                        value={formData.entrepreneur}
                        onChange={(entrepreneurId) => handleChange({ target: { name: 'entrepreneur', value: entrepreneurId } })}
                        options={[
                            { value: '', label: 'Seleccionar...' },
                            ...entrepreneurs.map(e => ({ value: e.id, label: e.company_name })),
                        ]}
                    />
                    <div className="form-text">
                        Persona o empresa que suministra este producto.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productBaseUomSelect">Unidad base *</label>
                    <AppSelect
                        id="productBaseUomSelect"
                        name="base_uom"
                        value={formData.base_uom}
                        onChange={(uomId) => handleChange({ target: { name: 'base_uom', value: uomId } })}
                        options={[
                            { value: '', label: 'Seleccionar...' },
                            ...uoms.map((uom) => ({ value: uom.id, label: uom.name })),
                        ]}
                    />
                    <div className="form-text">
                        Unidad atómica del stock. Las conversiones de venta y kardex se calculan desde esta base.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productBusinessUnitSelect">Sede / Punto de venta *</label>
                    <AppSelect
                        id="productBusinessUnitSelect"
                        name="business_unit"
                        value={formData.business_unit}
                        onChange={(businessUnitId) => handleChange({ target: { name: 'business_unit', value: businessUnitId } })}
                        options={[
                            { value: '', label: 'Seleccionar...' },
                            ...businessUnits.map(bu => ({ value: bu.id, label: bu.name })),
                        ]}
                    />
                    <div className="form-text">
                        Lugar donde se vende o almacena este producto.
                    </div>
                </div>
            </div>
        </AppModal>
    );
};

export default ProductModal;
