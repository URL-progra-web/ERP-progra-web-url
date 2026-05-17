import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

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

const ProductsTable = ({ products, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                        <td colSpan="7" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando…</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {products.length === 0 ? (
                <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                        No se encontraron productos. Crea uno nuevo para empezar.
                    </td>
                </tr>
            ) : products.map(product => (
                <tr key={product.id} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
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
                                <div className="fw-bold text-body">{product.name}</div>
                                {product.description && (
                                    <small className="text-muted d-block text-truncate" style={{ maxWidth: 300 }}>
                                        {product.description}
                                    </small>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="py-3">
                        {product.category_name
                            ? <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">{product.category_name}</span>
                            : <span className="text-muted fst-italic">Sin categoría</span>
                        }
                    </td>
                    <td className="py-3 text-secondary">
                        {product.entrepreneur_name || <span className="text-muted fst-italic">-</span>}
                    </td>
                    <td className="py-3 text-secondary">
                        {product.business_unit_name || <span className="text-muted fst-italic">-</span>}
                    </td>
                    <td className="py-3 text-secondary">
                        {product.base_uom_name || <span className="text-muted fst-italic">-</span>}
                    </td>
                    <td className="py-3 text-end">
                        <TableActions actions={[
                            { icon: FiEdit2,  onClick: () => onEdit(product),   title: 'Editar',   variant: 'primary' },
                        ]} />
                    </td>
                    <td className="px-4 py-3 text-end">
                        <DeleteActionButton onClick={() => onDelete(product)} />
                    </td>
                </tr>
            ))}
        </tbody>
    );
};

export default ProductsTable;
