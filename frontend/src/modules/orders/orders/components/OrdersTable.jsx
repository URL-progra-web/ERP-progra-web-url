import React from 'react';
import { FiCheck, FiEye, FiPackage, FiRotateCw, FiTrash2, FiTruck, FiX } from 'react-icons/fi';
import { formatCurrency } from '../helpers/formatCurrency';

const getTransitionIcon = (targetStatus) => {
    const normalized = String(targetStatus || '').toUpperCase();

    if (normalized === 'CONFIRMADO') return FiCheck;
    if (normalized === 'ENVIADO') return FiTruck;
    if (normalized === 'ENTREGADO') return FiPackage;
    if (normalized === 'CANCELADO') return FiX;
    return FiRotateCw;
};

export const OrdersTable = ({
    orders,
    isLoading,
    onViewDetail,
    onDelete,
    onTransition,
    getTransitions,
    deletingOrderId,
    transitioningOrderId,
}) => {
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
                        <th className="border-0 bg-transparent text-secondary py-3">Cambiar Estado</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Items</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-end">Total</th>
                        <th className="border-0 bg-transparent text-secondary py-3">Fecha de Creación</th>
                        <th className="border-0 bg-transparent text-secondary py-3 text-center">Eliminar</th>
                        <th className="border-0 bg-transparent text-secondary py-3 pe-4 text-end">Detalle</th>
                    </tr>
                </thead>
                <tbody className="border-top-0">
                    {orders.map((order) => {
                        const transitions = getTransitions?.(order) || [];
                        const isDeleting = deletingOrderId === order.id;
                        const isTransitioning = transitioningOrderId === order.id;
                        const canDelete = String(order.status_name || '').toUpperCase() === 'SOLICITADO';

                        return (
                            <tr key={order.id}>
                                <td className="ps-4">
                                    <span className="fw-medium">{order.short_id}</span>
                                </td>
                                <td>{order.customer_name || `Cliente #${order.customer}`}</td>
                                <td>{order.payment_method_name || 'N/A'}</td>
                                <td>{order.status_name || `Estado #${order.status}`}</td>
                                <td>
                                    {transitions.length ? (
                                        <div className="d-flex flex-wrap gap-2">
                                            {transitions.map((targetStatus) => (
                                                <button
                                                    key={`${order.id}-${targetStatus}`}
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center"
                                                    style={{ width: '2rem', height: '2rem' }}
                                                    disabled={isTransitioning || isDeleting}
                                                    onClick={() => onTransition?.(order, targetStatus)}
                                                    title={targetStatus}
                                                    aria-label={`Cambiar pedido ${order.short_id} a ${targetStatus}`}
                                                >
                                                    {React.createElement(getTransitionIcon(targetStatus), { size: 15 })}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-muted small">Sin cambios</span>
                                    )}
                                </td>
                                <td className="text-end">{order.total_quantity ?? 0}</td>
                                <td className="text-end">{formatCurrency(order.total_amount)}</td>
                                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="text-center">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center"
                                        style={{ width: '2rem', height: '2rem' }}
                                        disabled={isDeleting || isTransitioning || !canDelete}
                                        onClick={() => onDelete?.(order)}
                                        title={canDelete ? 'Eliminar pedido' : 'Solo se puede eliminar en estado SOLICITADO'}
                                        aria-label={`Eliminar pedido ${order.short_id}`}
                                    >
                                        <FiTrash2 size={15} />
                                    </button>
                                </td>
                                <td className="text-end pe-4">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center text-body"
                                        style={{ width: '2rem', height: '2rem' }}
                                        disabled={isDeleting || isTransitioning}
                                        onClick={() => onViewDetail?.(order.id)}
                                        title="Ver detalle"
                                        aria-label={`Ver detalle del pedido ${order.short_id}`}
                                    >
                                        <FiEye size={15} />
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
