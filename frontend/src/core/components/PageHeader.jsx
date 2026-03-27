import React from 'react';

const PageHeader = ({
    title,
    subtitle,
    icon: Icon,
    helper,
    actions,
    actionLabel,
    actionIcon: ActionIcon,
    actionVariant,
    onAction,
    className = '',
}) => {
    return (
        <div
            className={`mb-4 ${className}`}
            style={{
                background: 'var(--bs-secondary-bg)',
                border: '1px solid var(--bs-border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                flexWrap: 'wrap',
            }}
        >
            {/* Left: icon + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {Icon && (
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 'var(--radius-md)',
                            background: 'rgba(var(--bs-primary-rgb), 0.14)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Icon size={20} style={{ color: 'var(--bs-primary)' }} />
                    </div>
                )}
                <div>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            color: 'var(--bs-body-color)',
                        }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            style={{
                                margin: '3px 0 0',
                                fontSize: '12px',
                                color: 'var(--bs-secondary-color)',
                                fontFamily: 'var(--font-mono)',
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right: helper + actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginLeft: 'auto' }}>
                {helper}
                {actions}
                {actionLabel && (
                    <button
                        type="button"
                        className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                        onClick={onAction}
                    >
                        {ActionIcon && <ActionIcon size={15} />}
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
