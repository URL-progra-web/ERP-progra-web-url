import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AppPagination = ({ page, numPages, count, onPageChange }) => {
    if (numPages <= 1) return null;

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                padding: '12px 20px',
                borderTop: '1px solid var(--bs-border-color)',
            }}
        >
            <span
                style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--bs-secondary-color)',
                }}
            >
                Pág. {page} / {numPages} · {count} registros
            </span>

            <div style={{ display: 'flex', gap: '4px' }}>
                <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    disabled={page <= 1}
                    onClick={() => onPageChange(page - 1)}
                >
                    <FiChevronLeft size={14} />
                    Anterior
                </button>
                <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    disabled={page >= numPages}
                    onClick={() => onPageChange(page + 1)}
                >
                    Siguiente
                    <FiChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default AppPagination;
