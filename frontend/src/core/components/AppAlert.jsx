import React from 'react';
import { FiInfo, FiAlertTriangle, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import AppModal from './AppModal';

const TYPE_CONFIG = {
    info:    { tone: 'primary', icon: FiInfo,          iconColor: 'var(--bs-primary)' },
    warning: { tone: 'dark',    icon: FiAlertTriangle,  iconColor: '#f59e0b' },
    danger:  { tone: 'danger',  icon: FiTrash2,         iconColor: '#ef4444' },
    success: { tone: 'primary', icon: FiCheckCircle,    iconColor: '#22c55e' },
};

const AppAlert = ({
    type = 'info',
    header,
    content,
    confirmLabel = 'Confirmar',
    onConfirm,
    onClose,
}) => {
    const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.info;
    const Icon = config.icon;

    const handleSubmit = (e) => {
        e?.preventDefault();
        onConfirm?.();
    };

    const titleNode = (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon size={18} style={{ color: config.iconColor, flexShrink: 0 }} />
            {header}
        </span>
    );

    return (
        <AppModal
            title={titleNode}
            tone={config.tone}
            onClose={onClose}
            onSubmit={onConfirm ? handleSubmit : undefined}
            submitLabel={confirmLabel}
            cancelLabel="Cancelar"
            size="sm"
        >
            <p style={{ margin: 0, lineHeight: 1.65, color: 'var(--bs-secondary-color)' }}>
                {content}
            </p>
        </AppModal>
    );
};

export default AppAlert;
