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
    const actionClass = actionVariant ? `btn btn-${actionVariant}` : 'btn btn-primary';

    return (
        <div className={`page-header ${className}`}>
            <div className="page-header__main">
                {Icon && (
                    <div className="page-header__icon">
                        <Icon size={20} />
                    </div>
                )}
                <div className="page-header__copy">
                    <h2>{title}</h2>
                    {subtitle && (
                        <p>{subtitle}</p>
                    )}
                </div>
            </div>

            <div className="page-header__actions">
                {helper}
                {actions}
                {actionLabel && (
                    <button
                        type="button"
                        className={`${actionClass} page-header__action-button d-inline-flex align-items-center gap-2`}
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
