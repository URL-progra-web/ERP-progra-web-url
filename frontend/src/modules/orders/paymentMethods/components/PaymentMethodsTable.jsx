import React from 'react';
import { FiPower } from 'react-icons/fi';

export const PaymentMethodsTable = ({
    records,
    isLoading,
    onToggle,
}) => {
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    if (!records.length) {
        return <div className="text-center py-5 text-muted">No se encontraron métodos de pago.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
                <thead className="bg-body-tertiary small text-uppercase text-muted">
                    <tr>
                        <th className="border-0 px-4">Nombre</th>
                        <th className="border-0">Estado</th>
                        <th className="border-0 text-end px-4">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((method) => (
                        <tr key={method.id}>
                            <td className="px-4 fw-semibold">{method.name}</td>
                            <td>
                                <span className={`badge rounded-pill ${method.is_active ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}`}>
                                    {method.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="text-end px-4">
                                <button
                                    className={`btn btn-sm px-3 ${method.is_active ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                    onClick={() => onToggle(method)}
                                >
                                    <FiPower className="me-2" />
                                    {method.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
