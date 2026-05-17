import React, { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronRight, FiEdit2, FiTrash2 } from 'react-icons/fi';
import TableActions from '~/core/components/TableActions';

const CategoriesTable = ({ categories, isLoading, onEdit, onDelete }) => {
    const [expanded, setExpanded] = useState(new Set());

    const groupedCategories = useMemo(() => {
        const existingIds = new Set(categories.map(category => category.id));
        const byParent = categories.reduce((acc, category) => {
            const hasVisibleParent = category.parent && existingIds.has(category.parent);
            const key = hasVisibleParent ? category.parent : 'root';
            if (!acc[key]) acc[key] = [];
            acc[key].push(category);
            return acc;
        }, {});

        Object.values(byParent).forEach(list => list.sort((a, b) => a.name.localeCompare(b.name)));

        return {
            root: byParent['root'] || [],
            children: byParent,
        };
    }, [categories]);

    const toggleExpand = (id) => {
        setExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const renderRows = (nodes, level = 0) => nodes.map(category => {
        const children = groupedCategories.children[category.id] || [];
        const hasChildren = children.length > 0;
        const isExpanded = expanded.has(category.id);

        return (
            <React.Fragment key={category.id}>
                <tr className="border-bottom border-light-subtle">
                    <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
                            {hasChildren ? (
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-light border-0 p-0 text-secondary"
                                    onClick={() => toggleExpand(category.id)}
                                    aria-label={isExpanded ? 'Contraer subcategorías' : 'Expandir subcategorías'}
                                >
                                    {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                                </button>
                            ) : (
                                <span className="text-muted small" style={{ width: '1.5rem' }}></span>
                            )}
                            <div>
                                <div className="fw-bold text-body">{category.name}</div>
                                {category.parent_name && (
                                    <small className="text-muted">Dentro de: {category.parent_name}</small>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="py-3">
                        {category.is_leaf
                            ? (
                                <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1">
                                    Final
                                </span>
                            ) : (
                                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">
                                    Agrupadora
                                </span>
                            )}
                        {hasChildren && !category.is_leaf && (
                            <small className="text-muted ms-2">{children.length} subcategoría(s)</small>
                        )}
                    </td>
                    <td className="py-3 text-secondary small">
                        {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                        <TableActions actions={[
                            { icon: FiEdit2,  onClick: () => onEdit(category),   title: 'Editar',   variant: 'primary' },
                            { icon: FiTrash2, onClick: () => onDelete(category), title: 'Eliminar', variant: 'danger'  },
                        ]} />
                    </td>
                </tr>
                {hasChildren && isExpanded && renderRows(children, level + 1)}
            </React.Fragment>
        );
    });

    if (isLoading) {
        return (
            <tbody>
                <tr>
                    <td colSpan="4" className="text-center py-5">
                        <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                        <span className="text-muted">Cargando…</span>
                    </td>
                </tr>
            </tbody>
        );
    }

    if (categories.length === 0) {
        return (
            <tbody>
                <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">
                        No se encontraron categorías. Crea una nueva para empezar.
                    </td>
                </tr>
            </tbody>
        );
    }

    return (
        <tbody>
            {renderRows(groupedCategories.root)}
        </tbody>
    );
};

export default CategoriesTable;
