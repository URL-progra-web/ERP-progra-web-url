import React from 'react';

/**
 * AppAlert — Reusable confirmation/info dialog for all modules.
 *
 * Props:
 *   type        : 'info' | 'warning' | 'danger' | 'success'  (default: 'info')
 *   header      : Dialog title string
 *   content     : Body message (string or JSX)
 *   confirmLabel: Label for the confirm action button (default: 'Confirmar')
 *   onConfirm   : Function to call when the confirm button is clicked (optional).
 *                 If not provided, the confirm button is not shown.
 *   onClose     : Function to call when X or Cancel is clicked (required)
 */

const TYPE_MAP = {
    info:    { headerBg: 'bg-info',    icon: 'ℹ️',  btnClass: 'btn-info'    },
    warning: { headerBg: 'bg-warning', icon: '⚠️',  btnClass: 'btn-warning' },
    danger:  { headerBg: 'bg-danger',  icon: '🗑️', btnClass: 'btn-danger'  },
    success: { headerBg: 'bg-success', icon: '✅',  btnClass: 'btn-success' },
};

const AppAlert = ({
    type = 'info',
    header,
    content,
    confirmLabel = 'Confirmar',
    onConfirm,
    onClose,
}) => {
    const { headerBg, icon, btnClass } = TYPE_MAP[type] ?? TYPE_MAP.info;

    return (
        <div
            className="modal show d-block"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 440 }}>
                <div className="modal-content border-0 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className={`modal-header ${headerBg} text-white border-0 py-3`}>
                        <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
                            <span>{icon}</span>
                            <span>{header}</span>
                        </h6>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            aria-label="Cerrar"
                            onClick={onClose}
                        />
                    </div>

                    {/* Body */}
                    <div className="modal-body py-4 px-4">
                        <p className="mb-0" style={{ lineHeight: 1.6 }}>{content}</p>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0 pt-0">
                        <button
                            type="button"
                            className="btn btn-light fw-semibold"
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        {onConfirm && (
                            <button
                                type="button"
                                className={`btn ${btnClass} fw-semibold text-white`}
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppAlert;
