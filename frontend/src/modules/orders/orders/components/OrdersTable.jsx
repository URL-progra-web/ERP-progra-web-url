import React from 'react';
import { formatCurrency } from '../helpers/formatCurrency';

export const OrdersTable = ({ orders, isLoading, onViewDetail }) => {
    if (isLoading) {
        return <div className="text-center p-4">Cargando pedidos...</div>;
    }

    if (!orders || orders.length === 0) {
        return <div className="text-center p-4 text-muted">No se encontraron pedidos.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                    <tr>
                        <th className="border-0 bg-transparent text-secondary py-3 ps-4">ID Corto</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Cliente</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Método de Pago</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Estado</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Items</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Total</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Fecha de Creación</th>
                        <th className="border-0 bg-transparent text-secondary py-3 pe-4 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody className="border-top-0">
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td className="ps-4">
                                <span className="fw-medium">{order.short_id}</span>
                            </td>
                            <td>{order.customer_name || `Cliente #${order.customer}`}</td>
                            <td>{order.payment_method_name || 'N/A'}</td>
                            <td>{order.status_name || `Estado #${order.status}`}</td>
                            <td className="text-end">{order.total_quantity ?? 0}</td>
                            <td className="text-end">{formatCurrency(order.total_amount)}</td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                            <td className="text-end pe-4">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-dark"
                                    onClick={() => onViewDetail?.(order.id)}
                                >
                                    Ver detalle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
