import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const VariantsTable = ({ variants, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="8" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando...</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {variants.length === 0 ? (
                <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                        No se encontraron variantes. Crea una nueva para empezar.
                    </td>
                </tr>
            ) : variants.map(variant => (
                <tr key={variant.id} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            {variant.image_url ? (
                                <img
                                    src={variant.image_url}
                                    alt={variant.product_name}
                                    className="rounded-3 border flex-shrink-0"
                                    style={{ width: '52px', height: '52px', objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    className="rounded-3 border d-flex align-items-center justify-content-center text-muted flex-shrink-0"
                                    style={{ width: '52px', height: '52px', fontSize: '0.75rem' }}
                                >
                                    Sin foto
                                </div>
                            )}

                            <div>
                                <div className="fw-bold text-body">{variant.product_name}</div>
                                <small className="text-muted">SKU: {variant.sku}</small>
                            </div>
                        </div>
                    </td>

                    <td className="py-3">{variant.color_name || '—'}</td>
                    <td className="py-3">{variant.size_name || '—'}</td>
                    <td className="py-3">{variant.uom_name || '—'}</td>
                    <td className="py-3">Q {variant.cost}</td>
                    <td className="py-3">Q {variant.price}</td>
                    <td className="py-3">
                        <span className="fw-semibold me-2">{variant.quantity_available}</span>
                        {variant.is_active
                            ? <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1">Activa</span>
                            : <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary border border-secondary-subtle px-2 py-1">Inactiva</span>
                        }
                    </td>

                    <td className="px-4 py-3 text-end">
                        <button
                            className="btn btn-sm btn-outline-secondary border-0 me-2"
                            onClick={() => onEdit(variant)}
                            title="Editar"
                        >
                            <FiEdit2 size={14} className="text-primary" />
                        </button>

                        <button
                            className="btn btn-sm btn-outline-secondary border-0"
                            onClick={() => onDelete(variant)}
                            title="Eliminar"
                        >
                            <FiTrash2 size={14} className="text-danger" />
                        </button>
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default VariantsTable;
