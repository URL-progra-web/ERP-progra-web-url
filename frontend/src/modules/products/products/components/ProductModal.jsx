import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const ProductModal = ({ product, categories, entrepreneurs, businessUnits, uoms, onClose, onSave }) => {
    const isEditing = !!product;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        entrepreneur: '',
        business_unit: '',
        base_uom: '',
    });

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                category: product.category || '',
                entrepreneur: product.entrepreneur || '',
                business_unit: product.business_unit || '',
                base_uom: product.base_uom || '',
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

            <form onSubmit={handleSubmit} id="productForm">
                <div className="mb-3">
                    <label className="form-label fw-semibold">Nombre del producto *</label>
                    <input
                        type="text"
                        name="name"
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
                    <label className="form-label fw-semibold">Descripción</label>
                    <textarea
                        name="description"
                        className="form-control"
                        rows="2"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Breve descripción del producto..."
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Categoría</label>
                    <select
                        name="category"
                        className="form-select"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Sin categoría</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <div className="form-text">
                        Grupo al que pertenece este producto (ej. Frutas, Ropa, Bebidas).
                    </div>
                </div>

                <hr className="my-3" />

                <div className="mb-3">
                    <label className="form-label fw-semibold">Emprendedor / Proveedor *</label>
                    <select
                        name="entrepreneur"
                        className="form-select"
                        value={formData.entrepreneur}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar...</option>
                        {entrepreneurs.map(e => (
                            <option key={e.id} value={e.id}>{e.company_name}</option>
                        ))}
                    </select>
                    <div className="form-text">
                        Persona o empresa que suministra este producto.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Unidad base *</label>
                    <select
                        name="base_uom"
                        className="form-select"
                        value={formData.base_uom}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar...</option>
                        {uoms.map((uom) => (
                            <option key={uom.id} value={uom.id}>{uom.name}</option>
                        ))}
                    </select>
                    <div className="form-text">
                        Unidad atómica del stock. Las conversiones de venta y kardex se calculan desde esta base.
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label fw-semibold">Sede / Punto de venta *</label>
                    <select
                        name="business_unit"
                        className="form-select"
                        value={formData.business_unit}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar...</option>
                        {businessUnits.map(bu => (
                            <option key={bu.id} value={bu.id}>{bu.name}</option>
                        ))}
                    </select>
                    <div className="form-text">
                        Lugar donde se vende o almacena este producto.
                    </div>
                </div>
            </form>
        </AppModal>
    );
};

export default ProductModal;
