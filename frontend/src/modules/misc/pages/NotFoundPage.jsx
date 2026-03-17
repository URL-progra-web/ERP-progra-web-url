import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center">
            <h1 className="display-1 font-weight-bold text-muted">404</h1>
            <h4 className="text-secondary mb-4">Página no encontrada</h4>
            <p className="text-muted mb-4">La pantalla que buscas no existe o no tienes permisos para verla.</p>
            <Link to="/dashboard" className="btn btn-primary px-4 py-2">
                Volver al Panel
            </Link>
        </div>
    );
};

export default NotFoundPage;
