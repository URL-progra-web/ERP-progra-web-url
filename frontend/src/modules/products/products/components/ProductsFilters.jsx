import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { RecursiveHierarchySelector } from '~/core/components';

const ProductsFilters = ({ 
    searchInput, onSearchChange, onSearch, 
    categoryFilter, onCategoryChange,
    entrepreneurFilter, onEntrepreneurChange,
    businessUnitFilter, onBusinessUnitChange,
    baseUomFilter, onBaseUomChange,
    categories, entrepreneurs, businessUnits, uoms
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-12 col-lg-5 d-flex flex-column gap-2">
                    <form onSubmit={handleSubmit} className="input-group">
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            type="text"
                            id="productsSearchInput"
                            name="products_search"
                            autoComplete="off"
                            aria-label="Buscar producto por nombre"
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
                    <select
                        id="productsEntrepreneurFilter"
                        name="products_entrepreneur_filter"
                        aria-label="Filtrar productos por emprendedor"
                        className="form-select bg-body shadow-none text-body"
                        value={entrepreneurFilter}
                        onChange={(e) => onEntrepreneurChange(e.target.value)}
                    >
                        <option value="">Todos los emprendedores</option>
                        {entrepreneurs.map(ent => (
                            <option key={ent.id} value={ent.id}>{ent.company_name}</option>
                        ))}
                    </select>

                    <select
                        id="productsBusinessUnitFilter"
                        name="products_business_unit_filter"
                        aria-label="Filtrar productos por sede"
                        className="form-select bg-body shadow-none text-body"
                        value={businessUnitFilter}
                        onChange={(e) => onBusinessUnitChange(e.target.value)}
                    >
                        <option value="">Todas las sedes</option>
                        {businessUnits.map(bu => (
                            <option key={bu.id} value={bu.id}>{bu.name}</option>
                        ))}
                    </select>

                    <select
                        id="productsUomFilter"
                        name="products_uom_filter"
                        aria-label="Filtrar productos por unidad base"
                        className="form-select bg-body shadow-none text-body"
                        value={baseUomFilter}
                        onChange={(e) => onBaseUomChange(e.target.value)}
                    >
                        <option value="">Todas las UOM base</option>
                        {uoms.map((uom) => (
                            <option key={uom.id} value={uom.id}>{uom.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-lg-7 d-flex justify-content-lg-end">
                    <div className="w-100" style={{ maxWidth: '700px' }}>
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

export default ProductsFilters;
