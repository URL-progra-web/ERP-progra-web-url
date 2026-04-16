import React from 'react';
import { FiSearch } from 'react-icons/fi';

const CategoriesFilters = ({ searchInput, onSearchChange, onSearch, leafFilter, onLeafChange }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-md">
                    <form onSubmit={handleSubmit} className="input-group">
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            type="text"
                            id="categoriesSearchInput"
                            name="categories_search"
                            autoComplete="off"
                            aria-label="Buscar categoría por nombre"
                            className="form-control bg-body border-start-0 ps-0 shadow-none text-body"
                            placeholder="Buscar categoría por nombre..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                        >
                            Buscar
                        </button>
                    </form>
                </div>
                <div className="col-md-auto">
                    <select
                        id="categoriesLeafFilter"
                        name="categories_leaf_filter"
                        aria-label="Filtrar categorías por tipo"
                        className="form-select bg-body shadow-none text-body"
                        value={leafFilter}
                        onChange={(e) => onLeafChange(e.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="leaf">Solo finales (se asignan a productos)</option>
                        <option value="parent">Solo agrupadoras (contienen subcategorías)</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default CategoriesFilters;
