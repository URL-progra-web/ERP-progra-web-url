import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => (
    <div
        className="page-enter"
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
            gap: '16px',
        }}
    >
        <span
            style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                fontSize: 'clamp(4rem, 12vw, 7rem)',
                color: 'var(--bs-border-color)',
                lineHeight: 1,
                letterSpacing: '-0.05em',
                userSelect: 'none',
            }}
        >
            404
        </span>
        <h3 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--bs-body-color)',
        }}>
            Página no encontrada
        </h3>
        <p style={{ margin: 0, color: 'var(--bs-secondary-color)', fontSize: '14px', maxWidth: 340 }}>
            La pantalla que buscas no existe o no tienes permisos para verla.
        </p>
        <Link
            to="/dashboard"
            className="btn btn-primary d-flex align-items-center gap-2 mt-2"
        >
            <FiArrowLeft size={16} />
            Volver al panel
        </Link>
    </div>
);

export default NotFoundPage;
