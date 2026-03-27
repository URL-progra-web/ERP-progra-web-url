import React, { useMemo, useState } from 'react';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const renderSpec = (variant) => {
    const parts = [variant.color_name, variant.size_name, variant.base_uom_name].filter(Boolean);
    return parts.length ? parts.join(' / ') : 'Sin especificaciones';
};

export const OrderCatalogTable = ({ variants, isLoading, onAdd, cartItems = [], uoms = [], conversionsByBaseUom = {} }) => {
    const [selectedUoms, setSelectedUoms] = useState({});
    const quantitiesByVariant = cartItems.reduce((acc, item) => {
        acc[Number(item.variant_id)] = Number(item.base_quantity || item.quantity || 0);
        return acc;
    }, {});
    const uomsById = useMemo(() => Object.fromEntries(uoms.map((uom) => [Number(uom.id), uom])), [uoms]);

    if (isLoading) {
        return <div className="text-center py-5 text-muted">Cargando catalogo...</div>;
    }

    if (!variants.length) {
        return <div className="text-center py-5 text-muted">No encontramos variantes con esos filtros.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table align-middle mb-0">
                <thead className="table-light text-uppercase small">
                    <tr>
                        <th className="px-4 py-3 border-0">Producto</th>
                        <th className="py-3 border-0">Especificacion</th>
                        <th className="py-3 border-0">Emprendedor/Proveedor</th>
                        <th className="py-3 border-0">Sede</th>
                        <th className="py-3 border-0 text-end">Precio</th>
                        <th className="py-3 border-0 text-end">Stock</th>
                        <th className="px-4 py-3 border-0 text-end">Accion</th>
                    </tr>
                </thead>
                <tbody>
                    {variants.map((variant) => {
                        const cartQuantity = quantitiesByVariant[Number(variant.id)] || 0;
                        const stock = Number(variant.quantity_available ?? 0);
                        const baseUomId = Number(variant.base_uom ?? 0);
                        const applicableConversions = conversionsByBaseUom[baseUomId] || [];
                        const availableUoms = [
                            ...(baseUomId ? [{ id: baseUomId, name: variant.base_uom_name, multiplier: '1.0000' }] : []),
                            ...applicableConversions.map((conversion) => ({
                                id: conversion.from_uom_id,
                                name: conversion.from_uom_name,
                                multiplier: conversion.multiplier,
                            })),
                        ].filter((uom, index, array) => array.findIndex((candidate) => Number(candidate.id) === Number(uom.id)) === index);
                        const requestedUomId = Number(selectedUoms[variant.id] || baseUomId);
                        const selectedUomId = availableUoms.some((uom) => Number(uom.id) === requestedUomId)
                            ? requestedUomId
                            : baseUomId;
                        const selectedUom = availableUoms.find((uom) => Number(uom.id) === selectedUomId)
                            || uomsById[selectedUomId];
                        const selectedMultiplier = Number(selectedUom?.multiplier ?? 1);
                        const nextBaseQuantity = cartQuantity + selectedMultiplier;
                        const isAtStockLimit = nextBaseQuantity > stock;
                        return (
                            <tr key={variant.id}>
                                <td className="px-4 py-3">
                                    <div className="fw-semibold">{variant.product_name || 'Producto sin nombre'}</div>
                                    <div className="small text-muted">SKU: {variant.sku}</div>
                                </td>
                                <td className="py-3 text-muted">{renderSpec(variant)}</td>
                                <td className="py-3 text-muted">{variant.entrepreneur_name || '—'}</td>
                                <td className="py-3 text-muted">{variant.business_unit_name || '—'}</td>
                                <td className="py-3 text-end fw-semibold">{formatMoney(variant.price)}</td>
                                <td className="py-3 text-end">{stock} {variant.base_uom_name || ''}</td>
                                <td className="px-4 py-3 text-end">
                                    <select
                                        className="form-select form-select-sm mb-2"
                                        value={selectedUomId || ''}
                                        onChange={(e) => setSelectedUoms((prev) => ({ ...prev, [variant.id]: e.target.value }))}
                                    >
                                        {availableUoms.map((uom) => (
                                            <option key={`${variant.id}-${uom.id}`} value={uom.id}>{uom.name}</option>
                                        ))}
                                    </select>
                                    <div className="small text-muted mb-2 text-start">
                                        UOM de operacion. 1 {selectedUom?.name || variant.base_uom_name} = {selectedMultiplier} {variant.base_uom_name || 'unidad base'}.
                                    </div>
                                    <button
                                        className="btn btn-sm btn-dark"
                                        type="button"
                                        onClick={() => onAdd?.(variant, 1, selectedUom)}
                                        disabled={isAtStockLimit}
                                    >
                                        {cartQuantity > 0 ? <FiShoppingCart className="me-2" /> : <FiPlus className="me-2" />}
                                        {isAtStockLimit ? 'Stock completo en carrito' : cartQuantity > 0 ? `Agregar otra (${cartQuantity})` : 'Agregar'}
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
