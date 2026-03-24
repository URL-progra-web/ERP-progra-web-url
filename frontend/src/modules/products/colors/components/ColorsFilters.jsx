import React from 'react';
import { FiSearch } from 'react-icons/fi';

const ColorsFilters = ({ searchInput, onSearchChange }) => {
    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="input-group">
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            type="text"
                            className="form-control bg-body border-start-0 ps-0 shadow-none text-body"
                            placeholder="Buscar color por nombre..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorsFilters;