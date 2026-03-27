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

const HOVER_BG = {
    default: 'rgba(var(--bs-body-color-rgb, 221,230,244), 0.08)',
    primary: 'rgba(var(--bs-primary-rgb), 0.12)',
    danger:  'rgba(239, 68, 68, 0.12)',
    success: 'rgba(34, 197, 94, 0.12)',
    warning: 'rgba(245, 158, 11, 0.12)',
};

const HOVER_COLOR = {
    default: 'var(--bs-body-color)',
    primary: 'var(--bs-primary)',
    danger:  '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
};

const ActionBtn = ({ icon: Icon, onClick, title, variant = 'default', disabled = false, size = 15 }) => {
    const [hovered, setHovered] = React.useState(false);

    const bg    = hovered && !disabled ? (HOVER_BG[variant]    ?? HOVER_BG.default)    : 'transparent';
    const color = hovered && !disabled ? (HOVER_COLOR[variant] ?? HOVER_COLOR.default) : 'var(--bs-secondary-color)';

    return (
        <button
            type="button"
            title={title}
            disabled={disabled}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: 30,
                height: 30,
                padding: 0,
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                background: bg,
                color,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'background 0.15s, color 0.15s',
                flexShrink: 0,
            }}
        >
            <Icon size={size} />
        </button>
    );
};

const TableActions = ({ actions, justify = 'flex-end' }) => (
    <div style={{ display: 'flex', gap: '3px', justifyContent: justify }}>
        {actions.map((action, i) => (
            <ActionBtn key={i} {...action} />
        ))}
    </div>
);

export default TableActions;
