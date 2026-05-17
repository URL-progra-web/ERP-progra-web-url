import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const AppPagination = ({ page, numPages, count, onPageChange }) => {
    const currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    const totalPages = Number.isFinite(numPages) && numPages > 0 ? numPages : 1;
    const totalCount = Number.isFinite(count) && count >= 0 ? count : 0;

    return (
        <div className="app-pagination">
            <span className="app-pagination__meta">
                Pág. {currentPage} / {totalPages} · {totalCount} registros
            </span>

            <div className="app-pagination__actions">
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
