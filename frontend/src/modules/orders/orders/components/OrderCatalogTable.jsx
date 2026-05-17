import React, { useMemo, useState } from 'react';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';
import { AppSelect } from '~/core/components';

const EMPTY_ARRAY = [];
const EMPTY_CONVERSIONS = {};

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const renderSpec = (variant) => {
    const parts = [variant.color_name, variant.size_name, variant.base_uom_name].filter(Boolean);
    return parts.length ? parts.join(' / ') : 'Sin especificaciones';
};

const VariantActionPanel = ({
    variant,
    selectedUomId,
    availableUoms,
    selectedUom,
    selectedMultiplier,
    cartQuantity,
    isAtStockLimit,
    onSelectUom,
    onAdd,
    compact = false,
}) => (
    <div className={compact ? 'order-catalog-action order-catalog-action--card' : 'order-catalog-action'}>
        <label className="visually-hidden" htmlFor={`orderCreateVariantUom-${variant.id}`}>
            Seleccionar UOM para {variant.product_name || `variante ${variant.id}`}
        </label>
        <AppSelect
            id={`orderCreateVariantUom-${variant.id}`}
            name={`order_create_variant_uom_${variant.id}`}
            className="mb-2"
            value={selectedUomId || ''}
            onChange={(uomId) => onSelectUom(variant.id, uomId)}
            options={availableUoms.map((uom) => ({ value: uom.id, label: uom.name }))}
        />
        <div className="small text-muted mb-2 text-start">
            1 {selectedUom?.name || variant.base_uom_name} = {selectedMultiplier} {variant.base_uom_name || 'unidad base'}.
        </div>
        <button
            className={`btn ${compact ? 'btn-dark w-100' : 'btn btn-sm btn-dark'}`}
            type="button"
            onClick={() => onAdd?.(variant, 1, selectedUom)}
            disabled={isAtStockLimit}
        >
            {cartQuantity > 0 ? <FiShoppingCart className="me-2" /> : <FiPlus className="me-2" />}
            {isAtStockLimit ? 'Stock completo en carrito' : cartQuantity > 0 ? `Agregar otra (${cartQuantity})` : 'Agregar'}
        </button>
    </div>
);

export const OrderCatalogTable = ({ variants, isLoading, onAdd, cartItems = EMPTY_ARRAY, uoms = EMPTY_ARRAY, conversionsByBaseUom = EMPTY_CONVERSIONS }) => {
    const [selectedUoms, setSelectedUoms] = useState({});
    const quantitiesByVariant = cartItems.reduce((acc, item) => {
        acc[Number(item.variant_id)] = Number(item.base_quantity || item.quantity || 0);
        return acc;
    }, {});
    const uomsById = useMemo(() => Object.fromEntries(uoms.map((uom) => [Number(uom.id), uom])), [uoms]);

    if (isLoading) {
        return <div className="text-center py-5 text-muted">Cargando catalogo…</div>;
    }

    if (!variants.length) {
        return <div className="text-center py-5 text-muted">No encontramos variantes con esos filtros.</div>;
    }

    const handleSelectUom = (variantId, uomId) => {
        setSelectedUoms((prev) => ({ ...prev, [variantId]: uomId }));
    };

    return (
        <>
        <div className="table-responsive d-none d-lg-block">
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
                                    <VariantActionPanel
                                        variant={variant}
                                        selectedUomId={selectedUomId}
                                        availableUoms={availableUoms}
                                        selectedUom={selectedUom}
                                        selectedMultiplier={selectedMultiplier}
                                        cartQuantity={cartQuantity}
                                        isAtStockLimit={isAtStockLimit}
                                        onSelectUom={handleSelectUom}
                                        onAdd={onAdd}
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
        <div className="d-flex d-lg-none flex-column gap-3">
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
                    <article key={variant.id} className="order-catalog-card">
                        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                            <div>
                                <div className="fw-semibold">{variant.product_name || 'Producto sin nombre'}</div>
                                <div className="small text-muted">SKU: {variant.sku}</div>
                            </div>
                            {cartQuantity > 0 && (
                                <span className="order-create-pill order-create-pill--success">
                                    {cartQuantity} en carrito
                                </span>
                            )}
                        </div>

                        <div className="order-catalog-card__meta">
                            <span>{renderSpec(variant)}</span>
                            <span>{variant.entrepreneur_name || 'Sin proveedor'}</span>
                            <span>{variant.business_unit_name || 'Sin sede'}</span>
                        </div>

                        <div className="order-catalog-card__stats">
                            <div>
                                <div className="small text-muted">Precio</div>
                                <div className="fw-semibold">{formatMoney(variant.price)}</div>
                            </div>
                            <div className="text-end">
                                <div className="small text-muted">Stock</div>
                                <div className="fw-semibold">{stock} {variant.base_uom_name || ''}</div>
                            </div>
                        </div>

                        <VariantActionPanel
                            variant={variant}
                            selectedUomId={selectedUomId}
                            availableUoms={availableUoms}
                            selectedUom={selectedUom}
                            selectedMultiplier={selectedMultiplier}
                            cartQuantity={cartQuantity}
                            isAtStockLimit={isAtStockLimit}
                            onSelectUom={handleSelectUom}
                            onAdd={onAdd}
                            compact
                        />
                    </article>
                );
            })}
        </div>
        </>
    );
};
