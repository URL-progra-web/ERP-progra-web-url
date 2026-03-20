import React from 'react';

const AppPagination = ({ page, numPages, count, onPageChange, isDark = false }) => {
    if (numPages <= 1) return null;

    const bgClass = isDark ? 'bg-dark text-white border-top' : 'bg-body border-top';
    const btnClass = isDark ? 'btn-outline-light' : 'btn-outline-secondary';

    return (
        <div className={`px-4 py-3 d-flex justify-content-between align-items-center flex-wrap gap-3 ${bgClass}`}>
            <small className={isDark ? 'text-white-50' : 'text-muted'}>
                Página {page} de {numPages} ({count} registros)
            </small>
            <div className="btn-group">
                <button
                    className={`btn btn-sm ${btnClass}`}
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    Anterior
                </button>
                <div className={`btn btn-sm ${btnClass} disabled`}>
                    {page} / {numPages}
                </div>
                <button
                    className={`btn btn-sm ${btnClass}`}
                    disabled={page >= numPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default AppPagination;
