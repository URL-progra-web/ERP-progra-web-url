import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

const SizesTable = ({ sizes, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="3" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando...</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {sizes.length === 0 ? (
                <tr>
                    <td colSpan="3" className="text-center py-5 text-muted">
                        No se encontraron tallas. Crea una nueva para empezar.
                    </td>
                </tr>
            ) : sizes.map(size => (
                <tr key={size.id} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <div className="fw-bold text-body">{size.name}</div>
                    </td>

                    <td className="py-3 text-secondary small">
                        {size.created_at
                            ? new Date(size.created_at).toLocaleDateString()
                            : '—'}
                    </td>

                    <td className="px-4 py-3 text-end">
                        <TableActions actions={[
                            { icon: FiEdit2,  onClick: () => onEdit(size),   title: 'Editar',   variant: 'primary' },
                            { icon: FiTrash2, onClick: () => onDelete(size), title: 'Eliminar', variant: 'danger'  },
                        ]} />
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default SizesTable;