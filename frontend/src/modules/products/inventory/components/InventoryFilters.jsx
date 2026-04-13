import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { RecursiveHierarchySelector } from '~/core/components';

const InventoryFilters = ({ 
    searchInput, onSearchChange, onSearch, 
    categoryFilter, onCategoryChange,
    categories
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-12">
                    <form onSubmit={handleSubmit} className="input-group">
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            type="text"
                            id="inventoryProductsSearchInput"
                            name="inventory_products_search"
                            autoComplete="off"
                            aria-label="Buscar producto por nombre para ajustes"
                            className="form-control bg-body border-start-0 ps-0 shadow-none text-body"
                            placeholder="Buscar producto por nombre..."
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

                <div className="col-12">
                    <div className="w-100">
                        <RecursiveHierarchySelector
                            items={categories}
                            value={categoryFilter}
                            onChange={onCategoryChange}
                            getId={(item) => item?.id}
                            getParentId={(item) => item?.parent}
                            getLabel={(item) => item?.name}
                            getIsLeaf={(item) => item?.is_leaf}
                            rootOptionLabel="Todas las categorías"
                            levelRootLabel="Filtrar por categoría"
                            levelChildLabel={(parentName) => `Subcategorías de "${parentName || 'Categoría'}"`}
                            selectionMode="any"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventoryFilters;
