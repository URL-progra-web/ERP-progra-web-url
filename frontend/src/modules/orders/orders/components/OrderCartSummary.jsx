import React from 'react';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const getLineTitle = (item) => {
    const parts = [item.color_name, item.size_name, item.selected_uom_name || item.base_uom_name].filter(Boolean);
    return parts.length ? parts.join(' / ') : 'Sin especificaciones';
};

export const OrderCartSummary = ({
    items,
    availableUomsByItem = {},
    shippingCost,
    onShippingCostChange,
    onIncrement,
    onDecrement,
    onQuantityChange,
    onSelectedUomChange,
    onRemove,
    onClear,
}) => {
    const subtotal = items.reduce((sum, item) => sum + (Number(item.unit_price ?? 0) * Number(item.quantity ?? 0)), 0);
    const shipping = Number(shippingCost || 0);
    const total = subtotal + (Number.isFinite(shipping) ? shipping : 0);

    return (
        <div className="d-flex flex-column gap-3">
            <div className="d-flex justify-content-between align-items-center">
                <div>
                    <h6 className="mb-1 text-uppercase text-muted small">Carrito</h6>
                    <div className="text-muted small">{items.length} variante(s) seleccionada(s)</div>
                </div>
                {!!items.length && (
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={onClear}>
                        Vaciar
                    </button>
                )}
            </div>

            {!items.length ? (
                <div className="border rounded-4 p-4 text-center text-muted bg-body-tertiary">
                    Agrega variantes desde el catalogo para armar el pedido.
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {items.map((item) => {
                        const lineTotal = Number(item.unit_price ?? 0) * Number(item.quantity ?? 0);
                        return (
                            <div key={`${item.variant_id}-${item.selected_uom_id}`} className="border rounded-4 p-3 bg-body-tertiary">
                                <div className="d-flex justify-content-between gap-3 align-items-start">
                                    <div>
                                        <div className="fw-semibold">{item.product_name}</div>
                                        <div className="small text-muted">SKU: {item.sku}</div>
                                        <div className="small text-muted">{getLineTitle(item)}</div>
                                    </div>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onRemove(item.variant_id, item.selected_uom_id)}>
                                        <FiTrash2 />
                                    </button>
                                </div>

                                <div className="d-flex justify-content-between align-items-center gap-3 mt-3 flex-wrap">
                                    <div style={{ minWidth: 180 }}>
                                        <label className="form-label small text-muted mb-1">UOM de operacion</label>
                                        <select
                                            className="form-select form-select-sm"
                                            value={item.selected_uom_id || ''}
                                            onChange={(e) => onSelectedUomChange?.(item.variant_id, item.selected_uom_id, e.target.value)}
                                        >
                                            {(availableUomsByItem[`${item.variant_id}`] || []).map((uom) => (
                                                <option key={uom.id} value={uom.id}>{uom.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="small text-muted">
                                        Precio: <span className="fw-semibold text-body">{formatMoney(item.unit_price)}</span>
                                    </div>
                                    <div className="small text-muted">
                                        Stock disponible: <span className="fw-semibold text-body">{item.stock} {item.base_uom_name}</span>
                                    </div>
                                    <div className="small text-muted">
                                        Conversion: <span className="fw-semibold text-body">x{item.conversion_multiplier}</span>
                                    </div>
                                </div>

                                <div className="d-flex justify-content-between align-items-center gap-3 mt-3 flex-wrap">
                                    <div className="input-group" style={{ maxWidth: 170 }}>
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => onDecrement(item.variant_id, item.selected_uom_id)}>
                                            <FiMinus />
                                        </button>
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-control text-center"
                                            value={item.quantity}
                                            onChange={(e) => onQuantityChange(item.variant_id, item.selected_uom_id, e.target.value)}
                                        />
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => onIncrement(item.variant_id, item.selected_uom_id)}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <div className="fw-semibold">Subtotal: {formatMoney(lineTotal)} · {item.base_quantity} {item.base_uom_name}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="border rounded-4 p-3 bg-dark text-white">
                <div className="mb-3">
                    <label className="form-label small text-white-50">Costo de envio</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={shippingCost}
                        onChange={(e) => onShippingCostChange(e.target.value)}
                    />
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal</span>
                    <span>{formatMoney(subtotal)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                    <span>Envio</span>
                    <span>{formatMoney(shipping)}</span>
                </div>
                <div className="d-flex justify-content-between pt-2 border-top border-secondary fw-semibold fs-5">
                    <span>Total</span>
                    <span>{formatMoney(total)}</span>
                </div>
            </div>
        </div>
    );
};
