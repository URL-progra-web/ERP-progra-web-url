import React from 'react';
import { FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

export const EntrepreneursTable = ({ entrepreneurs, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (!entrepreneurs.length) {
        return <div className="text-center py-5 text-muted">No hay emprendedores registrados.</div>;
    }

    return (
        <div className="table-responsive">
            <table className="table table-hover align-middle">
                <thead className="bg-body-tertiary small text-uppercase text-muted">
                    <tr>
                        <th className="border-0 px-4">Empresa</th>
                        <th className="border-0">Contacto</th>
                        <th className="border-0">Usuario</th>
                        <th className="border-0">Creado</th>
                        <th className="border-0 text-end px-4">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {entrepreneurs.map((entrepreneur) => (
                        <tr key={entrepreneur.id}>
                            <td className="px-4">
                                <div className="fw-semibold">{entrepreneur.company_name}</div>
                                <div className="text-muted small">{entrepreneur.email || '—'}</div>
                            </td>
                            <td>
                                <div className="small">{entrepreneur.contact_name}</div>
                                <div className="text-muted small">{entrepreneur.phone || '—'}</div>
                            </td>
                            <td>
                                {entrepreneur.user ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <FiUser className="text-primary" />
                                        <div>
                                            <div className="small fw-medium">{entrepreneur.user.name}</div>
                                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {entrepreneur.user.email}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="badge bg-secondary">Sin asignar</span>
                                )}
                            </td>
                            <td>
                                <span className="badge bg-primary-subtle text-primary-emphasis">
                                    {new Date(entrepreneur.created_at).toLocaleDateString()}
                                </span>
                            </td>
                            <td className="text-end px-4">
                                <TableActions actions={[
                                    { icon: FiEdit2,  onClick: () => onEdit(entrepreneur),   title: 'Editar',   variant: 'primary' },
                                    { icon: FiTrash2, onClick: () => onDelete(entrepreneur), title: 'Eliminar', variant: 'danger'  },
                                ]} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
