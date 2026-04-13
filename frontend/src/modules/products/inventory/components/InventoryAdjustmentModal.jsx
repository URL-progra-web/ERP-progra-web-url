import React, { useState, useEffect, useCallback } from 'react';
import AppModal from '~/core/components/AppModal';
import { inventoryService } from '../services/inventoryService';

const InventoryAdjustmentModal = ({
    isOpen,
    product,
    transactionTypes,
    adjustmentType,
    onClose,
    onSave,
}) => {
    const [variants, setVariants] = useState([]);
    const [productData, setProductData] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isAddStock = adjustmentType === 'add';

    const fetchProductData = useCallback(async () => {
        if (!product?.id) return;
        try {
            const data = await inventoryService.getProduct(product.id);
            setProductData(data);
        } catch {
            setProductData({ base_uom: product.base_uom });
        }
    }, [product]);

    useEffect(() => {
        if (product && isOpen) {
            fetchProductData();
            setIsLoadingVariants(true);
            inventoryService.getVariants(product.id)
                .then((data) => {
                    const variantList = Array.isArray(data) ? data : data.results || [];
                    setVariants(variantList);
                    if (variantList.length > 0) {
                        setSelectedVariant(String(variantList[0].id));
                    } else {
                        setSelectedVariant('');
                    }
                })
                .catch(() => setVariants([]))
                .finally(() => setIsLoadingVariants(false));
        }
    }, [product, isOpen, fetchProductData]);

    useEffect(() => {
        if (isOpen && transactionTypes.length > 0) {
            const filteredTypes = transactionTypes.filter(t =>
                isAddStock ? t.factor === 1 : t.factor === -1,
            );
            if (filteredTypes.length > 0) {
                setSelectedType(filteredTypes[0].name);
            } else {
                setSelectedType('');
            }
        }
    }, [isOpen, transactionTypes, isAddStock]);

    useEffect(() => {
        if (!isOpen) {
            setSelectedVariant('');
            setSelectedType('');
            setQuantity('');
            setReason('');
            setVariants([]);
            setProductData(null);
        }
    }, [isOpen]);

    const selectedVariantData = variants.find(
        v => v.id === parseInt(selectedVariant),
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVariant || !selectedType || !quantity) return;

        const baseUomId = productData?.base_uom?.id || productData?.base_uom || product?.base_uom;

        setIsSaving(true);
        try {
            await onSave({
                variant_id: parseInt(selectedVariant),
                transaction_type_name: selectedType,
                selected_uom_id: baseUomId,
                quantity: parseFloat(quantity),
                notes: reason || null,
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        onClose();
    };

    const title = isAddStock ? 'Agregar Stock' : 'Remover Stock';
    const accentColor = isAddStock ? '#22c55e' : '#f59e0b';

    const filteredTypes = transactionTypes.filter(t =>
        isAddStock ? t.factor === 1 : t.factor === -1,
    );

    const hasVariants = variants.length > 0;
    const canSubmit =
        selectedVariant &&
        selectedType &&
        quantity &&
        parseFloat(quantity) > 0 &&
        (!isAddStock
            ? parseFloat(quantity) <= (selectedVariantData?.quantity_available || 0)
            : true);

    return (
        <AppModal
            isOpen={isOpen}
            title={title}
            accent={accentColor}
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitLabel={isAddStock ? 'Agregar' : 'Remover'}
            cancelLabel="Cancelar"
            submitDisabled={isSaving || !canSubmit}
            size="md"
        >
            <div className="mb-3">
                <label className="form-label fw-semibold">Producto</label>
                <input
                    type="text"
                    className="form-control"
                    value={product?.name || ''}
                    disabled
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Variante {hasVariants ? `(${variants.length} disponible(s))` : '(Sin variantes)'}
                </label>
                {isLoadingVariants ? (
                    <div className="form-control text-muted">
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Cargando variantes...
                    </div>
                ) : hasVariants ? (
                    <select
                        className="form-select"
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                    >
                        {variants.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.sku}
                                {v.size_name ? ` | Talla: ${v.size_name}` : ''}
                                {v.color_name ? ` | Color: ${v.color_name}` : ''}
                                {' | Stock: '}{v.quantity_available ?? 0}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="form-control text-muted">
                        Este producto no tiene variantes configuradas
                    </div>
                )}
                {selectedVariantData && (
                    <div className="mt-2 p-2 bg-body-tertiary rounded">
                        <small>
                            <strong>SKU:</strong> {selectedVariantData.sku}<br />
                            <strong>Precio:</strong> ${selectedVariantData.price}<br />
                            <strong>Stock actual:</strong> {selectedVariantData.quantity_available ?? 0}
                        </small>
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    {isAddStock ? 'Tipo de Entrada' : 'Tipo de Salida'}
                </label>
                {filteredTypes.length > 0 ? (
                    <select
                        className="form-select"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        {filteredTypes.map(t => (
                            <option key={t.name} value={t.name}>
                                {t.name} {t.description ? `- ${t.description}` : ''}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="form-control text-danger">
                        No hay tipos de {isAddStock ? 'entrada' : 'salida'} configurados.
                        <br />
                        <small>Ve a "Configurar Tipos" para crear uno.</small>
                    </div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    Cantidad
                    {!isAddStock && selectedVariantData && (
                        <span className="text-muted fw-normal"> (máx: {selectedVariantData.quantity_available ?? 0})</span>
                    )}
                </label>
                <input
                    type="number"
                    className="form-control"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="Ingrese la cantidad"
                />
            </div>

            <div className="mb-0">
                <label className="form-label fw-semibold">Nota / Motivo (opcional)</label>
                <textarea
                    className="form-control"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="2"
                    placeholder="Ej: Devolución de cliente, Merma por daño, Compra a proveedor"
                />
            </div>
        </AppModal>
    );
};

export default InventoryAdjustmentModal;
