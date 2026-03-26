import React from 'react';
import { FiPlus, FiShoppingCart } from 'react-icons/fi';

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const renderSpec = (variant) => {
    const parts = [variant.color_name, variant.size_name, variant.uom_name].filter(Boolean);
    return parts.length ? parts.join(' / ') : 'Sin especificaciones';
};

export const OrderCatalogTable = ({ variants, isLoading, onAdd, cartItems = [] }) => {
    const quantitiesByVariant = cartItems.reduce((acc, item) => {
        acc[Number(item.variant_id)] = item.quantity;
        return acc;
    }, {});

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
                        const isAtStockLimit = cartQuantity >= stock;
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
                                <td className="py-3 text-end">{stock}</td>
                                <td className="px-4 py-3 text-end">
                                    <button
                                        className="btn btn-sm btn-dark"
                                        type="button"
                                        onClick={() => onAdd?.(variant)}
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
