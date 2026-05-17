import React from 'react';
import { Link } from 'react-router-dom';
import { FiShieldOff, FiArrowLeft } from 'react-icons/fi';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        textAlign: 'center',
        gap: '16px',
    },
    iconBox: {
        width: 72, height: 72,
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    heading: {
        fontFamily: 'var(--font-mono)',
        fontWeight: 500,
        fontSize: '3.5rem',
        color: 'var(--bs-border-color)',
        margin: '0 0 4px',
        letterSpacing: '-0.04em',
    },
    subheading: {
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        margin: '0 0 8px',
        color: 'var(--bs-body-color)',
    },
    description: {
        margin: 0,
        color: 'var(--bs-secondary-color)',
        fontSize: '14px',
        maxWidth: 360,
        lineHeight: 1.6,
    },
};

const ForbiddenPage = () => (
    <div className="page-enter" style={styles.container}>
        <div style={styles.iconBox}>
            <FiShieldOff size={32} style={{ color: '#ef4444' }} />
        </div>

        <div>
            <h1 style={styles.heading}>403</h1>
            <h3 style={styles.subheading}>Acceso denegado</h3>
            <p style={styles.description}>
                No tienes permisos para acceder a esta sección. Contacta con tu administrador si crees que es un error.
            </p>
        </div>

        <Link to="/" className="btn btn-primary d-flex align-items-center gap-2 mt-2">
            <FiArrowLeft size={16} />
            Ir al inicio
        </Link>
    </div>
);

export default ForbiddenPage;
