import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

/**
 * Tabla de Unidades de Medida con filas de carga, vacío y datos.
 */
export function UomsTable({ uoms, isLoading, onEdit, onDelete }) {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan={3} className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2" />
                        <span className="text-muted">Cargando…</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {uoms.length === 0 ? (
                <tr>
                    <td colSpan={3} className="text-center py-5 text-muted">
                        No hay unidades registradas. Crea la primera UOM para comenzar.
                    </td>
                </tr>
            ) : (
                uoms.map((uom) => (
                    <tr key={uom.id} className="border-bottom border-light-subtle">
                        <td className="px-4 py-3">
                            <span className="uoms-code-chip">
                                {uom.code}
                            </span>
                        </td>
                        <td className="py-3 fw-semibold">{uom.name}</td>
                        <td className="px-4 py-3 text-end">
                            <TableActions actions={[
                                { icon: FiEdit2, onClick: () => onEdit(uom), title: 'Editar', variant: 'primary' },
                                { icon: FiTrash2, onClick: () => onDelete(uom), title: 'Eliminar', variant: 'danger' },
                            ]} />
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    );
}
