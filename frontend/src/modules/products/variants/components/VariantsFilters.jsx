import React from 'react';
import { FiSearch, FiRefreshCcw } from 'react-icons/fi';

const VariantsFilters = ({
    searchInput,
    onSearchChange,
    onSearch,
    activeFilter,
    onActiveChange,
    productFilter,
    onProductChange,
    entrepreneurFilter,
    onEntrepreneurChange,
    businessUnitFilter,
    onBusinessUnitChange,
    colorFilter,
    onColorChange,
    sizeFilter,
    onSizeChange,
    uomFilter,
    onUomChange,
    products = [],
    entrepreneurs = [],
    businessUnits = [],
    colors = [],
    sizes = [],
    uoms = [],
    onReset,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch();
    };

    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">
                <div>
                    <label className="form-label text-muted small mb-2" htmlFor="variantsSearchInput">Buscar</label>
                    <div className="input-group">
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            id="variantsSearchInput"
                            type="text"
                            name="variants_search"
                            autoComplete="off"
                            className="form-control bg-body border-start-0 ps-0 shadow-none text-body"
                            placeholder="Buscar variante por SKU o producto..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                        <button className="btn btn-primary" type="submit">
                            Buscar
                        </button>
                    </div>
                </div>

                <div className="row g-3">
                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsProductFilter">Producto</label>
                        <select
                            id="variantsProductFilter"
                            name="variants_product_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={productFilter}
                            onChange={(e) => onProductChange(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsColorFilter">Color</label>
                        <select
                            id="variantsColorFilter"
                            name="variants_color_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={colorFilter}
                            onChange={(e) => onColorChange(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {colors.map(color => (
                                <option key={color.id} value={color.id}>{color.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsEntrepreneurFilter">Emprendedor/Proveedor</label>
                        <select
                            id="variantsEntrepreneurFilter"
                            name="variants_entrepreneur_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={entrepreneurFilter}
                            onChange={(e) => onEntrepreneurChange(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {entrepreneurs.map((entrepreneur) => (
                                <option key={entrepreneur.id} value={entrepreneur.id}>{entrepreneur.company_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsBusinessUnitFilter">Sede</label>
                        <select
                            id="variantsBusinessUnitFilter"
                            name="variants_business_unit_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={businessUnitFilter}
                            onChange={(e) => onBusinessUnitChange(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {businessUnits.map((businessUnit) => (
                                <option key={businessUnit.id} value={businessUnit.id}>{businessUnit.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsSizeFilter">Talla</label>
                        <select
                            id="variantsSizeFilter"
                            name="variants_size_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={sizeFilter}
                            onChange={(e) => onSizeChange(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {sizes.map(size => (
                                <option key={size.id} value={size.id}>{size.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsUomFilter">UOM base</label>
                        <select
                            id="variantsUomFilter"
                            name="variants_uom_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={uomFilter}
                            onChange={(e) => onUomChange(e.target.value)}
                        >
                            <option value="">Todas</option>
                            {uoms.map(uom => (
                                <option key={uom.id} value={uom.id}>{uom.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsActiveFilter">Estado</label>
                        <select
                            id="variantsActiveFilter"
                            name="variants_active_filter"
                            autoComplete="off"
                            className="form-select bg-body shadow-none text-body"
                            value={activeFilter}
                            onChange={(e) => onActiveChange(e.target.value)}
                        >
                            <option value="">Todas</option>
                            <option value="true">Solo activas</option>
                            <option value="false">Solo inactivas</option>
                        </select>
                    </div>

                    <div className="col-12 col-md-6 col-xl-4 d-flex align-items-end">
                        <button
                            type="button"
                            className="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center"
                            onClick={onReset}
                        >
                            <FiRefreshCcw size={16} className="me-2" />
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default VariantsFilters;
