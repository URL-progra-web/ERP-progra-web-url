import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const CategoriesTable = ({ categories, isLoading, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="4" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando...</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {categories.length === 0 ? (
                <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                        No se encontraron categorías. Crea una nueva para empezar.
                    </td>
                </tr>
            ) : categories.map(category => (
                <tr key={category.id} className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <div className="fw-bold text-body">{category.name}</div>
                        {category.parent_name && (
                            <small className="text-muted">Dentro de: {category.parent_name}</small>
                        )}
                    </td>
                    <td className="py-3">
                        {category.is_leaf
                            ? <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1">Final</span>
                            : <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">Agrupadora</span>
                        }
                    </td>
                    <td className="py-3 text-secondary small">
                        {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                        <button
                            className="btn btn-sm btn-outline-secondary border-0 me-2"
                            onClick={() => onEdit(category)}
                            title="Editar"
                        >
                            <FiEdit2 size={14} className="text-primary" />
                        </button>
                        <button
                            className="btn btn-sm btn-outline-secondary border-0"
                            onClick={() => onDelete(category)}
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

export default CategoriesTable;
