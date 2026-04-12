import React, { useState, useEffect } from 'react';
import AppModal from '~/core/components/AppModal';

const InventoryAdjustmentModal = ({
    isOpen,
    product,
    transactionTypes,
    adjustmentType,
    onClose,
    onSave,
}) => {
    const [variants, setVariants] = useState([]);
    const [selectedVariant, setSelectedVariant] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [isLoadingVariants, setIsLoadingVariants] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isAddStock = adjustmentType === 'add';

    useEffect(() => {
        if (product && isOpen) {
            setIsLoadingVariants(true);
            fetch(`/api/products/products/${product.id}/variants/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                }
            })
                .then(res => res.json())
                .then(data => {
                    const variantList = Array.isArray(data) ? data : data.results || [];
                    setVariants(variantList);
                    if (variantList.length > 0) {
                        setSelectedVariant(variantList[0].id);
                    }
                })
                .catch(() => setVariants([]))
                .finally(() => setIsLoadingVariants(false));
        }
    }, [product, isOpen]);

    useEffect(() => {
        if (isOpen && transactionTypes.length > 0) {
            const typeMap = transactionTypes.reduce((acc, t) => {
                acc[t.operation] = t;
                return acc;
            }, {});
            const defaultType = isAddStock ? typeMap['add'] : typeMap['remove'];
            if (defaultType) {
                setSelectedType(defaultType.id);
            } else if (transactionTypes.length > 0) {
                setSelectedType(transactionTypes[0].id);
            }
        }
    }, [isOpen, transactionTypes, isAddStock]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedVariant || !selectedType || !quantity) return;

        setIsSaving(true);
        try {
            await onSave({
                product: product.id,
                variant: parseInt(selectedVariant),
                transaction_type: parseInt(selectedType),
                quantity: parseFloat(quantity),
                reason: reason || null,
            });
            handleClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setSelectedVariant('');
        setSelectedType('');
        setQuantity('');
        setReason('');
        setVariants([]);
        onClose();
    };

    const title = isAddStock ? 'Agregar Stock' : 'Remover Stock';
    const accentColor = isAddStock ? '#22c55e' : '#f59e0b';

    return (
        <AppModal
            isOpen={isOpen}
            title={title}
            accent={accentColor}
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitLabel={isAddStock ? 'Agregar' : 'Remover'}
            cancelLabel="Cancelar"
            submitDisabled={isSaving || !selectedVariant || !selectedType || !quantity}
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
                <label className="form-label fw-semibold">Variante</label>
                {isLoadingVariants ? (
                    <div className="form-control text-muted">Cargando variantes...</div>
                ) : variants.length > 0 ? (
                    <select
                        className="form-select"
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                    >
                        {variants.map(v => (
                            <option key={v.id} value={v.id}>
                                {v.name || v.sku || `Variante ${v.id}`}
                            </option>
                        ))}
                    </select>
                ) : (
                    <div className="form-control text-muted">No hay variantes disponibles</div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">
                    {isAddStock ? 'Tipo de Entrada' : 'Tipo de Salida'}
                </label>
                <select
                    className="form-select"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    {transactionTypes
                        .filter(t => isAddStock ? t.operation === 'add' : t.operation === 'remove')
                        .map(t => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))
                    }
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label fw-semibold">Cantidad</label>
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
                <label className="form-label fw-semibold">Motivo / Nota (opcional)</label>
                <textarea
                    className="form-control"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows="2"
                    placeholder="Ingrese un motivo o nota (ej: Devolución de cliente, Merma por daño)"
                />
            </div>
        </AppModal>
    );
};

export default InventoryAdjustmentModal;
