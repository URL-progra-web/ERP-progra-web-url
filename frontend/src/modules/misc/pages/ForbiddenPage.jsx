import React from 'react';
import { Link } from 'react-router-dom';
import { FiShieldOff } from 'react-icons/fi';

const ForbiddenPage = () => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 text-center bg-light p-4">
            <div className="bg-white p-5 rounded shadow-sm border" style={{ maxWidth: '500px' }}>
                <div className="mb-4">
                    <FiShieldOff size={80} className="text-danger opacity-75" />
                </div>
                <h1 className="display-4 font-weight-bold text-dark mb-2">403</h1>
                <h3 className="text-secondary mb-4">Acceso Denegado</h3>
                <p className="text-muted mb-4">
                    Lo sentimos, pero no tienes los permisos necesarios para acceder a esta sección del sistema. 
                    Si crees que esto es un error, contacta con tu administrador.
                </p>
                <Link to="/" className="btn btn-primary btn-lg px-5 font-weight-bold shadow-sm">
                    Ir al Inicio
                </Link>
            </div>
        </div>
    );
};

export default ForbiddenPage;
