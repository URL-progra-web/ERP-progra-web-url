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
            className="app-modal-backdrop"
        >
            <div className="app-modal-dialog" style={{ maxWidth }}>
                <Container
                    className="app-modal"
                    onSubmit={onSubmit}
                >
                    <div
                        className="app-modal__header section-header"
                        style={accent ? {
                            '--card-accent': accent,
                            background: `color-mix(in srgb, ${accent} 12%, var(--bs-tertiary-bg))`,
                        } : undefined}
                    >
                        <span>{title}</span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="app-modal__close"
                            aria-label="Cerrar"
                        >
                            <FiX size={15} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="app-modal__body">
                        {children}
                    </div>

                    {footer ?? (
                        <div className="app-modal__footer">
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
