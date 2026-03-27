import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

const TONE_SUBMIT = {
    primary:   'btn btn-primary fw-semibold',
    secondary: 'btn btn-secondary fw-semibold',
    dark:      'btn btn-primary fw-semibold',
    neutral:   'btn btn-primary fw-semibold',
    danger:    'btn btn-danger fw-semibold',
};

const AppModal = ({
    isOpen,
    title,
    tone = 'primary',
    onClose,
    onSubmit,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    submitDisabled = false,
    children,
    footer,
    size = 'md',
}) => {
    const shouldRender = typeof isOpen === 'undefined' ? true : isOpen;

    // Close on Escape
    useEffect(() => {
        if (!shouldRender) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [shouldRender, onClose]);

    // Lock body scroll while open
    useEffect(() => {
        if (!shouldRender) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [shouldRender]);

    if (!shouldRender) return null;

    const submitClass = TONE_SUBMIT[tone] ?? TONE_SUBMIT.primary;
    const Container = onSubmit ? 'form' : 'div';
    const maxWidth = size === 'lg' ? 700 : size === 'sm' ? 400 : 540;

    return ReactDOM.createPortal(
        /* Backdrop — rendered directly to body to escape any transformed containers */
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                zIndex: 1100,
                overflowY: 'auto',
                padding: 'max(5vh, 28px) 16px 40px',
                animation: 'fadeIn 0.15s ease both',
            }}
        >
            {/* Dialog wrapper — centered, scrolls with the backdrop */}
            <div
                style={{
                    width: '100%',
                    maxWidth,
                    margin: '0 auto',
                    animation: 'scaleIn 0.18s cubic-bezier(0.4,0,0.2,1) both',
                }}
            >
                <Container
                    className="modal-content"
                    onSubmit={onSubmit}
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--bs-border-color)',
                        flexShrink: 0,
                    }}>
                        <h5 className="modal-title" style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>
                            {title}
                        </h5>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'var(--bs-secondary-color)', padding: '4px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 'var(--radius-xs)', fontSize: '20px', lineHeight: 1,
                                transition: 'color var(--transition)',
                            }}
                            onMouseOver={e => e.currentTarget.style.color = 'var(--bs-body-color)'}
                            onMouseOut={e => e.currentTarget.style.color = 'var(--bs-secondary-color)'}
                        >
                            ×
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body" style={{ padding: '20px' }}>
                        {children}
                    </div>

                    {/* Footer */}
                    {footer ?? (
                        <div style={{
                            display: 'flex', justifyContent: 'flex-end', gap: '8px',
                            padding: '14px 20px',
                            borderTop: '1px solid var(--bs-border-color)',
                            flexShrink: 0,
                        }}>
                            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
                                {cancelLabel}
                            </button>
                            {onSubmit && (
                                <button type="submit" className={`${submitClass} btn-sm`} disabled={submitDisabled}>
                                    {submitLabel}
                                </button>
                            )}
                        </div>
                    )}
                </Container>
            </div>
        </div>,
        document.body
    );
};

export default AppModal;
