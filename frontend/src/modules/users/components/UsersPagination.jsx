import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const UsersPagination = ({ page, numPages, count, pageSize, onPageChange }) => {
    if (numPages <= 1) return null;

    // Build smart page list with ellipsis
    const pages = Array.from({ length: numPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === numPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
            if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
            acc.push(p);
            return acc;
        }, []);

    return (
        <div className="card-footer bg-white border-top d-flex align-items-center justify-content-between py-2 px-4">
            <small className="text-muted">
                Página {page} de {numPages} &mdash; {count} registros totales
            </small>
            <div className="d-flex align-items-center">
                <button
                    className="btn btn-sm btn-light border mr-1"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                >
                    <FiChevronLeft size={14} />
                </button>
                {pages.map((p, idx) =>
                    p === '…'
                        ? <span key={`e-${idx}`} className="px-2 text-muted">…</span>
                        : <button
                            key={p}
                            className={`btn btn-sm mr-1 ${page === p ? 'btn-primary' : 'btn-light border'}`}
                            onClick={() => onPageChange(p)}
                        >{p}</button>
                )}
                <button
                    className="btn btn-sm btn-light border"
                    onClick={() => onPageChange(Math.min(numPages, page + 1))}
                    disabled={page >= numPages}
                >
                    <FiChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default UsersPagination;
