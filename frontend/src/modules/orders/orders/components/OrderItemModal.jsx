import React, { useEffect, useState } from 'react';
import AppModal from '~/core/components/AppModal';
import { variantService } from '~/modules/products/variants/services/variantService';
import { normalizeList } from '../helpers/normalizeList';
import { formatCurrency } from '../helpers/formatCurrency';

export const OrderItemModal = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    item,
    statusOptions,
    orderId,
}) => {
    const isEdit = Boolean(item);

    const [formData, setFormData] = useState({
        variant_id: '',
        selected_uom_id: '',
        quantity: 1,
        status_id: '',
    });

    const [variantSearch, setVariantSearch] = useState('');
    const [variantOptions, setVariantOptions] = useState([]);
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);
    const [variantsError, setVariantsError] = useState('');

    useEffect(() => {
        if (!isOpen) return;

        if (item) {
            setFormData({
                variant_id: item.variant || '',
                selected_uom_id: item.selected_uom || '',
                quantity: item.quantity || 1,
                status_id: item.status || '',
            });
            return;
        }

        setFormData({
            variant_id: '',
            selected_uom_id: '',
            quantity: 1,
            status_id: '',
        });
        setVariantSearch('');
    }, [isOpen, item]);

    useEffect(() => {
        if (!isOpen || isEdit) return;

        let mounted = true;
        setIsLoadingVariants(true);
        setVariantsError('');

        const timer = setTimeout(async () => {
            try {
                const payload = await variantService.getVariants({
                    search: variantSearch || undefined,
                    is_active: true,
                    in_stock: true,
                    order_id: orderId,
                    page_size: 25,
                });
                if (!mounted) return;
                setVariantOptions(normalizeList(payload));
            } catch (err) {
                if (!mounted) return;
                setVariantsError(
                    err.response?.data?.error
                    || err.response?.data?.message
                    || err.response?.data?.detail
                    || 'No se pudieron cargar variantes'
                );
                setVariantOptions([]);
            } finally {
                if (mounted) setIsLoadingVariants(false);
            }
        }, 350);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [isOpen, isEdit, variantSearch, orderId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleVariantChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            variant_id: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            quantity: Number(formData.quantity),
        };

        if (!isEdit) {
            if (!selectedVariant) return;
            payload.variant_id = Number(selectedVariant.id);
            payload.selected_uom_id = Number(formData.selected_uom_id || selectedVariant.base_uom);
        }

        if (formData.status_id) {
            payload.status_id = Number(formData.status_id);
        }

        const success = await onSubmit(payload, item?.id);
        if (success) onClose();
    };

    const selectedVariant = !isEdit
        ? variantOptions.find((variant) => Number(variant.id) === Number(formData.variant_id))
        : null;

    const submitDisabled =
        isSubmitting ||
        !formData.quantity ||
        Number(formData.quantity) <= 0 ||
        (!isEdit && !selectedVariant);

    return (
        <AppModal
            isOpen={isOpen}
            onClose={onClose}
            title={isEdit ? 'Editar Item de Pedido' : 'Agregar Item al Pedido'}
            tone="dark" accent="var(--bs-orange)"
            size="md"
            onSubmit={handleSubmit}
            submitLabel={isEdit ? 'Guardar Cambios' : 'Agregar Item'}
            submitDisabled={submitDisabled}
        >
            {!isEdit && (
                <>
                    <div className="mb-2">
                        <label className="form-label">Buscar Variante</label>
                        <input
                            type="text"
                            className="form-control"
                            value={variantSearch}
                            onChange={(e) => setVariantSearch(e.target.value)}
                            placeholder="SKU, producto, talla o color"
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Variante *</label>
                        <select
                            className="form-select"
                            name="variant_id"
                            value={formData.variant_id}
                            onChange={handleVariantChange}
                            disabled={isLoadingVariants}
                        >
                            <option value="">
                                {isLoadingVariants ? 'Cargando variantes...' : '(Selecciona una variante)'}
                            </option>
                            {variantOptions.map((variant) => (
                                <option
                                    key={variant.id}
                                    value={String(variant.id)}
                                >
                                    {variant.sku} - {variant.product_name || 'Sin producto'}
                                </option>
                            ))}
                        </select>
                        <div className="form-text">
                            Filtra con el buscador y luego selecciona una variante. Resultados: {variantOptions.length}
                        </div>
                        {variantsError && <div className="text-danger small mt-1">{variantsError}</div>}
                    </div>

                    {selectedVariant && (
                        <div className="alert alert-secondary py-2 px-3 mb-3">
                            <div><strong>SKU:</strong> {selectedVariant.sku}</div>
                            <div><strong>Producto:</strong> {selectedVariant.product_name || '-'}</div>
                            <div><strong>Precio:</strong> {formatCurrency(selectedVariant.price)}</div>
                            <div><strong>Stock:</strong> {selectedVariant.quantity_available ?? 0} {selectedVariant.base_uom_name || ''}</div>
                        </div>
                    )}

                    {selectedVariant && (
                        <div className="mb-3">
                            <label className="form-label">UOM de operacion *</label>
                            <select
                                className="form-select"
                                name="selected_uom_id"
                                value={formData.selected_uom_id || selectedVariant.base_uom || ''}
                                onChange={handleChange}
                            >
                                <option value={selectedVariant.base_uom}>{selectedVariant.base_uom_name}</option>
                            </select>
                            <div className="form-text">
                                Por ahora el item usa la UOM base del producto. Luego puedes ampliar a conversiones configuradas.
                            </div>
                        </div>
                    )}
                </>
            )}

            <div className="mb-3">
                <label className="form-label">Cantidad *</label>
                <input
                    type="number"
                    min="1"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                />
            </div>

            <div className="mb-0">
                <label className="form-label">Estado del Item</label>
                <select
                    className="form-select"
                    name="status_id"
                    value={formData.status_id}
                    onChange={handleChange}
                >
                    <option value="">(Estado por defecto)</option>
                    {statusOptions.map((status) => (
                        <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                </select>
            </div>
        </AppModal>
    );
};
