import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { FiX } from 'react-icons/fi';

const TONE_SUBMIT = {
    primary:   'btn btn-primary fw-semibold',
    secondary: 'btn btn-secondary fw-semibold',
    dark:      'btn btn-dark fw-semibold',
    neutral:   'btn btn-primary fw-semibold',
    danger:    'btn btn-danger fw-semibold',
};

const SIZE_MAX = { sm: 400, md: 540, lg: 700, xl: 900 };

const AppModal = ({
    isOpen,
    title,
    tone = 'primary',
    accent,
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

    useEffect(() => {
        if (!shouldRender) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [shouldRender, onClose]);

    useEffect(() => {
        if (!shouldRender) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [shouldRender]);

    if (!shouldRender) return null;

    const submitClass = TONE_SUBMIT[tone] ?? TONE_SUBMIT.primary;
    const Container = onSubmit ? 'form' : 'div';
    const maxWidth = SIZE_MAX[size] ?? SIZE_MAX.md;

    return ReactDOM.createPortal(
        <div
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 1100,
                overflowY: 'auto',
                padding: 'max(5vh, 28px) 16px 40px',
                animation: 'fadeIn 0.15s ease both',
            }}
        >
            <div style={{
                width: '100%',
                maxWidth,
                margin: '0 auto',
                animation: 'scaleIn 0.18s cubic-bezier(0.4,0,0.2,1) both',
            }}>
                <Container
                    className="rounded-4 overflow-hidden border shadow-lg bg-body"
                    style={{ display: 'flex', flexDirection: 'column' }}
                    onSubmit={onSubmit}
                >
                    {/* Header */}
                    <div
                        className="section-header d-flex align-items-center justify-content-between"
                        style={accent ? {
                            '--card-accent': accent,
                            background: `color-mix(in srgb, ${accent} 12%, var(--bs-tertiary-bg))`,
                        } : undefined}
                    >
                        <span>{title}</span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="d-flex align-items-center justify-content-center p-1 border-0 bg-transparent rounded-2"
                            style={{
                                color: 'var(--card-accent, var(--bs-secondary-color))',
                                cursor: 'pointer',
                                transition: 'opacity 0.15s',
                                lineHeight: 1,
                            }}
                            onMouseOver={e => e.currentTarget.style.opacity = '0.7'}
                            onMouseOut={e => e.currentTarget.style.opacity = '1'}
                        >
                            <FiX size={15} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                        {children}
                    </div>

                    {/* Footer */}
                    {footer ?? (
                        <div
                            className="d-flex justify-content-end gap-2 px-4 py-3"
                            style={{ borderTop: '1px solid var(--bs-border-color)' }}
                        >
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
