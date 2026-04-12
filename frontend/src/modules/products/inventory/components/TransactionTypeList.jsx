import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

const TransactionTypeList = ({ types, onEdit, onDelete, isLoading }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="4" className="text-center py-4">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando...</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {types.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                        No hay tipos de transacción configurados.
                    </td>
                </tr>
            ) : types.map(type => (
                <tr key={type.name} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <span className="fw-semibold text-body">{type.name}</span>
                    </td>
                    <td className="py-3">
                        <span className={`badge ${type.factor === 1 ? 'bg-success bg-opacity-10 text-success border border-success-subtle' : 'bg-warning bg-opacity-10 text-warning border border-warning-subtle'}`}>
                            {type.factor === 1 ? '+1 Entrada' : '-1 Salida'}
                        </span>
                    </td>
                    <td className="py-3 text-secondary">
                        {type.description || <span className="fst-italic text-muted">Sin descripción</span>}
                    </td>
                    <td className="px-4 py-3 text-end">
                        <TableActions actions={[
                            { icon: FiEdit2, onClick: () => onEdit(type), title: 'Editar', variant: 'primary' },
                            { icon: FiTrash2, onClick: () => onDelete(type), title: 'Eliminar', variant: 'danger' },
                        ]} />
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default TransactionTypeList;
