import React from 'react';
import { FiEdit2, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

export const CustomersTable = ({ customers, isLoading, onEdit, onDelete, onCreateOrder }) => {
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (!customers.length) {
        return <div className="text-center py-5 text-muted">No hay clientes registrados.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead className="bg-body-tertiary small text-uppercase text-muted">
                    <tr>
                        <th className="border-0 px-4">Cliente</th>
                        <th className="border-0">Contacto</th>
                        <th className="border-0">Tipo</th>
                        <th className="border-0">Creado</th>
                        <th className="border-0 text-end px-4">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id}>
                            <td className="px-4">
                                <div className="fw-semibold">{customer.name}</div>
                                <div className="text-muted small">{customer.address || 'Sin dirección'}</div>
                            </td>
                            <td>
                                <div className="small">{customer.phone}</div>
                                <div className="text-muted small">{customer.email || '—'}</div>
                            </td>
                            <td>
                                <span className={`badge ${customer.customer_type === 'WHOLESALE' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-info-subtle text-info-emphasis'}`}>
                                    {customer.customer_type === 'WHOLESALE' ? 'Mayorista' : 'Minorista'}
                                </span>
                            </td>
                            <td>
                                <span className="badge bg-primary-subtle text-primary-emphasis">
                                    {new Date(customer.created_at).toLocaleDateString()}
                                </span>
                            </td>
                            <td className="text-end px-4">
                                <div className="btn-group btn-group-sm">
                                    {onCreateOrder && (
                                        <button
                                            className="btn btn-outline-success"
                                            onClick={() => onCreateOrder(customer)}
                                            title="Nuevo pedido"
                                        >
                                            <FiShoppingCart />
                                        </button>
                                    )}
                                    <button className="btn btn-outline-primary" onClick={() => onEdit(customer)}>
                                        <FiEdit2 />
                                    </button>
                                    <button className="btn btn-outline-danger" onClick={() => onDelete(customer)}>
                                        <FiTrash2 />
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
