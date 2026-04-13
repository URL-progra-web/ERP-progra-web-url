import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AppPagination = ({ page, numPages, count, onPageChange }) => {
    const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    const totalPages = Number.isFinite(numPages) && numPages > 0 ? numPages : 1;
    const totalCount = Number.isFinite(count) && count >= 0 ? count : 0;

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
                Pág. {currentPage} / {totalPages} · {totalCount} registros
            </span>

            <div style={{ display: 'flex', gap: '4px' }}>
                <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <FiChevronLeft size={14} />
                    Anterior
                </button>
                <button
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    Siguiente
                    <FiChevronRight size={14} />
                </button>
            </div>
        </div>
    );
};

export default AppPagination;
