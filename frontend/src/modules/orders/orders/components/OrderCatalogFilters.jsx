import React from 'react';
import { FiRefreshCcw, FiSearch } from 'react-icons/fi';
import { AppSelect } from '~/core/components';

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
                <label className="form-label text-muted small mb-2" htmlFor="orderCreateCatalogSearch">Buscar en catalogo</label>
                <div className="input-group">
                    <span className="input-group-text bg-body border-end-0 text-muted">
                        <FiSearch size={14} />
                    </span>
                    <input
                        id="orderCreateCatalogSearch"
                        type="text"
                        name="order_create_catalog_search"
                        autoComplete="off"
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
                    <label className="form-label small text-muted mb-1" htmlFor="orderCreateProductFilter">Producto</label>
                    <AppSelect
                        id="orderCreateProductFilter"
                        name="order_create_product_filter"
                        value={productFilter}
                        onChange={onProductChange}
                        options={[
                            { value: '', label: 'Todos' },
                            ...products.map((product) => ({ value: product.id, label: product.name })),
                        ]}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1" htmlFor="orderCreateColorFilter">Color</label>
                    <AppSelect
                        id="orderCreateColorFilter"
                        name="order_create_color_filter"
                        value={colorFilter}
                        onChange={onColorChange}
                        options={[
                            { value: '', label: 'Todos' },
                            ...colors.map((color) => ({ value: color.id, label: color.name })),
                        ]}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1" htmlFor="orderCreateEntrepreneurFilter">Emprendedor/Proveedor</label>
                    <AppSelect
                        id="orderCreateEntrepreneurFilter"
                        name="order_create_entrepreneur_filter"
                        value={entrepreneurFilter}
                        onChange={onEntrepreneurChange}
                        options={[
                            { value: '', label: 'Todos' },
                            ...entrepreneurs.map((entrepreneur) => ({ value: entrepreneur.id, label: entrepreneur.company_name })),
                        ]}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1" htmlFor="orderCreateBusinessUnitFilter">Sede</label>
                    <AppSelect
                        id="orderCreateBusinessUnitFilter"
                        name="order_create_business_unit_filter"
                        value={businessUnitFilter}
                        onChange={onBusinessUnitChange}
                        options={[
                            { value: '', label: 'Todas' },
                            ...businessUnits.map((businessUnit) => ({ value: businessUnit.id, label: businessUnit.name })),
                        ]}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1" htmlFor="orderCreateSizeFilter">Talla</label>
                    <AppSelect
                        id="orderCreateSizeFilter"
                        name="order_create_size_filter"
                        value={sizeFilter}
                        onChange={onSizeChange}
                        options={[
                            { value: '', label: 'Todas' },
                            ...sizes.map((size) => ({ value: size.id, label: size.name })),
                        ]}
                    />
                </div>

                <div className="col-12 col-md-6">
                    <label className="form-label small text-muted mb-1" htmlFor="orderCreateUomFilter">UOM base</label>
                    <AppSelect
                        id="orderCreateUomFilter"
                        name="order_create_uom_filter"
                        value={uomFilter}
                        onChange={onUomChange}
                        options={[
                            { value: '', label: 'Todas' },
                            ...uoms.map((uom) => ({ value: uom.id, label: uom.name })),
                        ]}
                    />
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
