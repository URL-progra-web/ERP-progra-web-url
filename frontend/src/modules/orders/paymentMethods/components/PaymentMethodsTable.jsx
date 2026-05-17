import React from 'react';
import { FiPower, FiEdit2, FiTrash2, FiLock } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

export const PaymentMethodsTable = ({
    records,
    isLoading,
    onToggle,
    onEdit,
    onDelete,
}) => {
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando…</span>
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
                            <td className="px-4 fw-semibold">
                                {method.name}
                                {method.is_protected && (
                                    <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2 ms-md-3 py-1 px-2 border border-secondary border-opacity-25" title="Método Protegido">
                                        <FiLock className="me-1" /> Sistema
                                    </span>
                                )}
                            </td>
                            <td>
                                <span className={`badge rounded-pill ${method.is_active ? 'bg-success-subtle text-success-emphasis' : 'bg-secondary-subtle text-secondary-emphasis'}`}>
                                    {method.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                            </td>
                            <td className="text-end px-4">
                                <TableActions actions={[
                                    {
                                        icon: FiPower,
                                        onClick: () => onToggle(method),
                                        title: method.is_active ? 'Desactivar' : 'Activar',
                                        variant: method.is_active ? 'warning' : 'success',
                                    },
                                    { icon: FiEdit2,  onClick: () => onEdit(method),   title: 'Editar',   variant: 'primary' },
                                    {
                                        icon: FiTrash2,
                                        onClick: () => onDelete(method),
                                        title: method.is_protected ? 'No se puede eliminar un método de sistema' : 'Eliminar',
                                        variant: 'danger',
                                        disabled: method.is_protected,
                                    },
                                ]} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
