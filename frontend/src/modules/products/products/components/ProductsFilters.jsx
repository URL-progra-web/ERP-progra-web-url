import React from 'react';
import { FiSearch } from 'react-icons/fi';

const ProductsFilters = ({ searchInput, onSearchChange, categoryFilter, onCategoryChange, categories }) => {
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
                            placeholder="Buscar producto por nombre..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <select
                        className="form-select bg-body shadow-none text-body"
                        value={categoryFilter}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ProductsFilters;
