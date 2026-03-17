import React from 'react';
import { FiEdit2, FiLock, FiUnlock } from 'react-icons/fi';

const StatusBadge = ({ isActive }) =>
    isActive
        ? <span className="badge rounded-pill bg-success px-2 py-1">Activo</span>
        : <span className="badge rounded-pill bg-danger px-2 py-1">Bloqueado</span>;

const UsersTable = ({ users, isLoading, onEdit, onToggleStatus }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="5" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando...</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {users.length === 0 ? (
                <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                        No se encontraron usuarios con los filtros aplicados.
                    </td>
                </tr>
            ) : users.map(user => (
                <tr key={user.id} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3 fw-bold text-body">{user.name}</td>
                    <td className="py-3 text-secondary">
                        {user.email || <span className="text-muted fst-italic">Sin email</span>}
                    </td>
                    <td className="py-3">
                        <span className="badge border border-secondary-subtle text-secondary py-1 px-2 rounded-pill bg-body-tertiary small fw-medium">
                            {user.role?.name || '—'}
                        </span>
                    </td>
                    <td className="py-3">
                        <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-4 py-3 text-end">
                        <button
                            className="btn btn-sm btn-outline-secondary border-0 me-2"
                            onClick={() => onEdit(user)}
                            title="Editar"
                        >
                            <FiEdit2 size={14} className="text-primary" />
                        </button>
                        <button
                            className={`btn btn-sm btn-outline-secondary border-0 ${user.is_active ? 'text-danger' : 'text-success'}`}
                            onClick={() => onToggleStatus(user)}
                            title={user.is_active ? 'Bloquear Acceso' : 'Desbloquear Acceso'}
                        >
                            {user.is_active ? <FiLock size={14} /> : <FiUnlock size={14} />}
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default UsersTable;
