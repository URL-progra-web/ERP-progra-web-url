import React from 'react';

const BUTTON_VARIANTS = {
    dark: 'btn btn-dark fw-semibold text-white',
    primary: 'btn btn-primary fw-semibold text-white',
    secondary: 'btn btn-secondary fw-semibold text-white',
    light: 'btn btn-outline-light fw-semibold text-white',
};

const PageHeader = ({
    title,
    subtitle,
    icon: Icon,
    helper,
    actions,
    actionLabel,
    actionIcon: ActionIcon,
    actionVariant = 'dark',
    isDark = false,
    onAction,
    className = '',
}) => {
    // Si está en modo oscuro, usar variantes de botón claras por defecto
    const effectiveVariant = isDark && !actionVariant ? 'light' : actionVariant;
    const buttonClass = BUTTON_VARIANTS[effectiveVariant] ?? BUTTON_VARIANTS.dark;
    
    return (
        <div className={`bg-body border rounded-4 shadow-sm p-3 p-md-4 mb-4 ${className} ${isDark ? 'bg-dark text-white' : ''}`}>
            <div className="d-flex align-items-start flex-wrap gap-3 justify-content-between">
                <div className="d-flex align-items-center gap-3">
                    {Icon && (
                        <div className={`rounded-3 ${isDark ? 'bg-white' : 'bg-dark'} ${isDark ? 'text-dark' : 'text-white'} d-flex align-items-center justify-content-center`} style={{ width: 48, height: 48 }}>
                            <Icon size={22} />
                        </div>
                    )}
                    <div>
                        <h2 className={`fw-bold mb-1 ${isDark ? 'text-white' : ''}`}>{title}</h2>
                        {subtitle && <small className={`${isDark ? 'text-white-50' : 'text-muted'}`}>{subtitle}</small>}
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap ms-auto">
                    {helper}
                    {actions}
                    {actionLabel && (
                        <button
                            type="button"
                            className={`${buttonClass} d-flex align-items-center gap-2 shadow-sm`}
                            onClick={onAction}
                        >
                            {ActionIcon && <ActionIcon size={16} />}
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
