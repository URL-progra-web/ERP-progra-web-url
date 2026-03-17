import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

/**
 * Tabla de Unidades de Medida con filas de carga, vacío y datos.
 */
export function UomsTable({ uoms, isLoading, onEdit, onDelete }) {
    return (
        <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
                <thead className="bg-body-tertiary text-muted small text-uppercase">
                    <tr>
                        <th className="border-0 px-4 py-3">Código</th>
                        <th className="border-0 py-3">Nombre</th>
                        <th className="border-0 px-4 py-3 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={3} className="text-center py-5 text-muted">
                                <div className="spinner-border spinner-border-sm me-2" /> Cargando...
                            </td>
                        </tr>
                    ) : uoms.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center py-5 text-muted">
                                No hay unidades de medida. Crea la primera.
                            </td>
                        </tr>
                    ) : (
                        uoms.map(uom => (
                            <tr key={uom.id}>
                                <td className="px-4">
                                    <span className="badge bg-primary-subtle text-primary-emphasis fw-bold fs-6">
                                        {uom.code}
                                    </span>
                                </td>
                                <td className="fw-semibold">{uom.name}</td>
                                <td className="px-4 text-end">
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        title="Editar"
                                        onClick={() => onEdit(uom)}
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Eliminar"
                                        onClick={() => onDelete(uom)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
