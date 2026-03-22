import React from 'react';

export const OrdersTable = ({ orders, isLoading }) => {
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
                        <th className="border-0 bg-transparent text-secondary py-3">Cliente (ID)</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Método de Pago (ID)</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Estado (ID)</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Fecha de Creación</th>
                    </tr>
                </thead>
                <tbody className="border-top-0">
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td className="ps-4">
                                <span className="fw-medium">{order.short_id}</span>
                            </td>
                            <td>{order.customer}</td>
                            <td>{order.payment_method || 'N/A'}</td>
                            <td>{order.status}</td>
                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
