import React from 'react';
import AppModal from './AppModal';

const TYPE_MAP = {
    info: { tone: 'dark', icon: 'ℹ️' },
    warning: { tone: 'dark', icon: '⚠️' },
    danger: { tone: 'dark', icon: '🗑️' },
    success: { tone: 'dark', icon: '✅' },
};

const AppAlert = ({
    type = 'info',
    header,
    content,
    confirmLabel = 'Confirmar',
    onConfirm,
    onClose,
}) => {
    const config = TYPE_MAP[type] ?? TYPE_MAP.info;

    const handleSubmit = (event) => {
        event?.preventDefault();
        onConfirm?.();
    };

    return (
        <AppModal
            title={(<span className="d-flex align-items-center gap-2"><span>{config.icon}</span><span>{header}</span></span>)}
            tone={config.tone}
            onClose={onClose}
            onSubmit={onConfirm ? handleSubmit : undefined}
            submitLabel={confirmLabel}
            cancelLabel="Cancelar"
        >
            <p className="mb-0" style={{ lineHeight: 1.6 }}>{content}</p>
        </AppModal>
    );
};

export default AppAlert;
