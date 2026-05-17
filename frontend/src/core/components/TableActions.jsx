import React from 'react';

/*
 * Standardized action buttons for table rows.
 *
 * Usage:
 *   <TableActions actions={[
 *     { icon: FiEdit2,  onClick: () => onEdit(item),   title: 'Editar',    variant: 'primary' },
 *     { icon: FiTrash2, onClick: () => onDelete(item), title: 'Eliminar',  variant: 'danger' },
 *   ]} />
 *
 * variants: 'default' | 'primary' | 'danger' | 'success' | 'warning'
 */

const ActionBtn = ({ icon: Icon, onClick, title, variant = 'default', disabled = false, size = 15 }) => {
    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            className={`table-action-btn table-action-btn--${variant}`}
        >
            {React.createElement(Icon, { size })}
        </button>
    );
};

const TableActions = ({ actions, justify = 'flex-end' }) => (
    <div className="table-actions" style={{ justifyContent: justify }}>
        {actions.map((action, i) => (
            <ActionBtn key={i} {...action} />
        ))}
    </div>
);

export default TableActions;
