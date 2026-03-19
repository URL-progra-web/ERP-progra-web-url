import React from 'react';
export const OrderStatusesTable = ({ statuses, isLoading }) => {
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-dark" />
            </div>
        );
    }

    if (!statuses.length) {
        return <div className="text-center py-5 text-muted">Sin estados configurados.</div>;
    }

    return (
        <ul className="list-group list-group-flush">
            {statuses.map((status) => (
                <li key={status.id} className="list-group-item d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <div>
                        <span className="badge bg-dark text-uppercase me-2">{status.name}</span>
                        <span className="text-muted small">{status.description || 'Sin descripción'}</span>
                    </div>
                    <span className="badge bg-light text-muted text-uppercase">Solo lectura</span>
                </li>
            ))}
        </ul>
    );
};
