import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

const getColorCode = (color) =>
    color.code || color.hex_code || color.color_code || color.codigo || '';

const DeleteActionButton = ({ onClick, title = 'Eliminar' }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className="table-action-btn table-action-btn--danger"
    >
        <FiTrash2 size={15} />
    </button>
);

const ColorsTable = ({ colors, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="6" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando…</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {colors.length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                        No se encontraron colores. Crea uno nuevo para empezar.
                    </td>
                </tr>
            ) : colors.map(color => {
                const colorCode = getColorCode(color);

                return (
                    <tr key={color.id} className="border-bottom border-light-subtle">
                        <td className="px-4 py-3">
                            <div className="fw-bold text-body">{color.name}</div>
                        </td>

                        <td className="py-3 text-secondary small">
                            {colorCode || '—'}
                        </td>

                        <td className="py-3">
                            {colorCode ? (
                                <span
                                    className="d-inline-block rounded border"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        backgroundColor: colorCode,
                                    }}
                                    title={colorCode}
                                />
                            ) : (
                                <span className="text-muted small">Sin código</span>
                            )}
                        </td>

                        <td className="py-3 text-secondary small">
                            {color.created_at
                                ? new Date(color.created_at).toLocaleDateString()
                                : color.created
                                    ? new Date(color.created).toLocaleDateString()
                                    : color.createdAt
                                        ? new Date(color.createdAt).toLocaleDateString()
                                        : '—'}
                        </td>
                        <td className="py-3 text-end">
                            <TableActions actions={[
                                { icon: FiEdit2,  onClick: () => onEdit(color),   title: 'Editar',   variant: 'primary' },
                            ]} />
                        </td>

                        <td className="px-4 py-3 text-end">
                            <DeleteActionButton onClick={() => onDelete(color)} />
                        </td>
                    </tr>
                );
            })}
        </tbody>
    );
};

export default ColorsTable;
