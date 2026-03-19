import React from 'react';
import { useAuth } from '~/core/auth/AuthContext';

const OverviewHome = () => {
    const { user } = useAuth();

    return (
        <div className="container-fluid p-0">
            <h2 className="font-weight-bold mb-4">Resumen General</h2>
            
            <div className="row">
                <div className="col-md-4 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body d-flex flex-column justify-content-center align-items-center p-5">
                            <h5 className="text-secondary font-weight-bold text-uppercase small mb-2">Bienvenido de nuevo</h5>
                            <h3 className="font-weight-bold text-dark">{user?.name}</h3>
                            <span className="badge badge-primary bg-primary mt-2 px-3 py-2">{user?.role?.name || 'Usuario'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="col-md-8 mb-4">
                    <div className="card shadow-sm border-0 h-100">
                        <div className="card-body">
                            <h5 className="card-title font-weight-bold border-bottom pb-3">Atajos Rápidos</h5>
                            <div className="alert alert-light border mt-3" role="alert">
                                Usa el menú izquierdo para navegar por los distintos módulos del ERP.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewHome;
