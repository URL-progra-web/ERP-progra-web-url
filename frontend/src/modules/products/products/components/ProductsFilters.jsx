import React from 'react';
import { FiSearch } from 'react-icons/fi';

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
                <div className="col-md">
                    <form onSubmit={handleSubmit} className="input-group">
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
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                        >
                            Buscar
                        </button>
                    </form>
                </div>
                <div className="col-md-auto d-flex flex-wrap gap-2">
                    <select
                        className="form-select bg-body shadow-none text-body"
                        style={{ minWidth: '180px' }}
                        value={categoryFilter}
                        onChange={(e) => onCategoryChange(e.target.value)}
                    >
                        <option value="">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select
                        className="form-select bg-body shadow-none text-body"
                        style={{ minWidth: '180px' }}
                        value={entrepreneurFilter}
                        onChange={(e) => onEntrepreneurChange(e.target.value)}
                    >
                        <option value="">Todos los emprendedores</option>
                        {entrepreneurs.map(ent => (
                            <option key={ent.id} value={ent.id}>{ent.company_name}</option>
                        ))}
                    </select>

                    <select
                        className="form-select bg-body shadow-none text-body"
                        style={{ minWidth: '180px' }}
                        value={businessUnitFilter}
                        onChange={(e) => onBusinessUnitChange(e.target.value)}
                    >
                        <option value="">Todas las sedes</option>
                        {businessUnits.map(bu => (
                            <option key={bu.id} value={bu.id}>{bu.name}</option>
                        ))}
                    </select>

                    <select
                        className="form-select bg-body shadow-none text-body"
                        style={{ minWidth: '180px' }}
                        value={baseUomFilter}
                        onChange={(e) => onBaseUomChange(e.target.value)}
                    >
                        <option value="">Todas las UOM base</option>
                        {uoms.map((uom) => (
                            <option key={uom.id} value={uom.id}>{uom.name}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ProductsFilters;
