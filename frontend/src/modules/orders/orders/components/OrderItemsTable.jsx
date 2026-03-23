import React from 'react';

export const OrderItemsTable = ({ items, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return <div className="text-center p-3">Cargando items...</div>;
    }

    if (!items?.length) {
        return <div className="text-center p-3 text-muted">Este pedido aún no tiene items.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="border-0 bg-transparent text-secondary py-3 ps-3">ID</th>
                        <th className="border-0 bg-transparent text-secondary py-3">SKU</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Cantidad</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Precio Unitario</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Subtotal</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Estado</th>
                        <th className="border-0 bg-transparent text-secondary py-3 pe-3 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item.id}>
                            <td className="ps-3">#{item.id}</td>
                            <td>{item.variant_sku || `Variant #${item.variant}`}</td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">
                                ${Number(item.unit_price ?? 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </td>
                            <td className="text-end fw-semibold">
                                ${Number(item.line_total ?? 0).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </td>
                            <td>{item.status_name || `#${item.status}`}</td>
                            <td className="text-end pe-3">
                                <div className="btn-group">
                                    <button type="button" className="btn btn-sm btn-outline-dark" onClick={() => onEdit?.(item)}>
                                        Editar
                                    </button>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onDelete?.(item)}>
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
