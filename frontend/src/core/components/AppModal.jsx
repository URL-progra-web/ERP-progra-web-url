import React from 'react';

const TONES = {
    primary: {
        headerClass: 'bg-primary text-white',
        closeClass: 'btn-close-white',
        submitClass: 'btn btn-primary fw-semibold',
    },
    secondary: {
        headerClass: 'bg-secondary text-white',
        closeClass: 'btn-close-white',
        submitClass: 'btn btn-secondary fw-semibold',
    },
    dark: {
        headerClass: 'bg-dark text-white',
        closeClass: 'btn-close-white',
        submitClass: 'btn btn-dark fw-semibold text-white',
    },
    neutral: {
        headerClass: 'bg-body border-bottom fw-bold',
        closeClass: '',
        submitClass: 'btn btn-primary fw-semibold',
    },
};

const DEFAULT_TONE = 'primary';

const AppModal = ({
    title,
    tone = DEFAULT_TONE,
    onClose,
    onSubmit,
    submitLabel = 'Guardar',
    cancelLabel = 'Cancelar',
    submitDisabled = false,
    children,
    footer,
    size = 'md',
}) => {
    const toneConfig = TONES[tone] || TONES[DEFAULT_TONE];
    const Container = onSubmit ? 'form' : 'div';

    return (
        <div
            className="modal show d-block"
            style={{ background: 'rgba(0,0,0,0.45)', zIndex: 1100 }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={`modal-dialog modal-dialog-centered modal-${size}`}>
                <Container className="modal-content border-0 shadow-lg" onSubmit={onSubmit}>
                    <div className={`modal-header ${toneConfig.headerClass}`}>
                        <h5 className="modal-title mb-0 fw-bold">{title}</h5>
                        <button type="button" className={`btn-close ${toneConfig.closeClass}`} onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        {children}
                    </div>
                    {footer ?? (
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                {cancelLabel}
                            </button>
                            {onSubmit && (
                                <button type="submit" className={toneConfig.submitClass} disabled={submitDisabled}>
                                    {submitLabel}
                                </button>
                            )}
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default AppModal;
