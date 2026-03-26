import React from 'react';
import { FiRefreshCcw, FiSearch } from 'react-icons/fi';

export const OrderCatalogFilters = ({
    searchInput,
    onSearchChange,
    onSearch,
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
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
                <label className="form-label text-muted small mb-2">Buscar en catalogo</label>
                <div className="input-group">
                    <span className="input-group-text bg-body border-end-0 text-muted">
                        <FiSearch size={14} />
                    </span>
                    <input
                        type="text"
                        className="form-control bg-body border-start-0 ps-0 shadow-none"
                        placeholder="SKU, producto, talla o color"
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <button className="btn btn-dark" type="submit">Buscar</button>
                </div>
            </div>

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1">Producto</label>
                    <select className="form-select" value={productFilter} onChange={(e) => onProductChange(e.target.value)}>
                        <option value="">Todos</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1">Color</label>
                    <select className="form-select" value={colorFilter} onChange={(e) => onColorChange(e.target.value)}>
                        <option value="">Todos</option>
                        {colors.map((color) => (
                            <option key={color.id} value={color.id}>{color.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1">Emprendedor/Proveedor</label>
                    <select className="form-select" value={entrepreneurFilter} onChange={(e) => onEntrepreneurChange(e.target.value)}>
                        <option value="">Todos</option>
                        {entrepreneurs.map((entrepreneur) => (
                            <option key={entrepreneur.id} value={entrepreneur.id}>{entrepreneur.company_name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1">Sede</label>
                    <select className="form-select" value={businessUnitFilter} onChange={(e) => onBusinessUnitChange(e.target.value)}>
                        <option value="">Todas</option>
                        {businessUnits.map((businessUnit) => (
                            <option key={businessUnit.id} value={businessUnit.id}>{businessUnit.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1">Talla</label>
                    <select className="form-select" value={sizeFilter} onChange={(e) => onSizeChange(e.target.value)}>
                        <option value="">Todas</option>
                        {sizes.map((size) => (
                            <option key={size.id} value={size.id}>{size.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1">Unidad de medida</label>
                    <select className="form-select" value={uomFilter} onChange={(e) => onUomChange(e.target.value)}>
                        <option value="">Todas</option>
                        {uoms.map((uom) => (
                            <option key={uom.id} value={uom.id}>{uom.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-12">
                    <button type="button" className="btn btn-outline-secondary w-100" onClick={onReset}>
                        <FiRefreshCcw size={16} className="me-2" />
                        Limpiar filtros
                    </button>
                </div>
            </div>
        </form>
    );
};
