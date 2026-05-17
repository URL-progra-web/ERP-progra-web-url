import React from 'react';
import { FiSearch, FiRefreshCcw } from 'react-icons/fi';
import { AppSelect } from '~/core/components';

const EMPTY_ARRAY = [];

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
    products = EMPTY_ARRAY,
    entrepreneurs = EMPTY_ARRAY,
    businessUnits = EMPTY_ARRAY,
    colors = EMPTY_ARRAY,
    sizes = EMPTY_ARRAY,
    uoms = EMPTY_ARRAY,
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
                        <AppSelect
                            id="variantsProductFilter"
                            name="variants_product_filter"
                            value={productFilter}
                            onChange={onProductChange}
                            options={[
                                { value: '', label: 'Todos' },
                                ...products.map(product => ({ value: product.id, label: product.name })),
                            ]}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsColorFilter">Color</label>
                        <AppSelect
                            id="variantsColorFilter"
                            name="variants_color_filter"
                            value={colorFilter}
                            onChange={onColorChange}
                            options={[
                                { value: '', label: 'Todos' },
                                ...colors.map(color => ({ value: color.id, label: color.name })),
                            ]}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsEntrepreneurFilter">Emprendedor/Proveedor</label>
                        <AppSelect
                            id="variantsEntrepreneurFilter"
                            name="variants_entrepreneur_filter"
                            value={entrepreneurFilter}
                            onChange={onEntrepreneurChange}
                            options={[
                                { value: '', label: 'Todos' },
                                ...entrepreneurs.map((entrepreneur) => ({ value: entrepreneur.id, label: entrepreneur.company_name })),
                            ]}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsBusinessUnitFilter">Sede</label>
                        <AppSelect
                            id="variantsBusinessUnitFilter"
                            name="variants_business_unit_filter"
                            value={businessUnitFilter}
                            onChange={onBusinessUnitChange}
                            options={[
                                { value: '', label: 'Todas' },
                                ...businessUnits.map((businessUnit) => ({ value: businessUnit.id, label: businessUnit.name })),
                            ]}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsSizeFilter">Talla</label>
                        <AppSelect
                            id="variantsSizeFilter"
                            name="variants_size_filter"
                            value={sizeFilter}
                            onChange={onSizeChange}
                            options={[
                                { value: '', label: 'Todas' },
                                ...sizes.map(size => ({ value: size.id, label: size.name })),
                            ]}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsUomFilter">UOM base</label>
                        <AppSelect
                            id="variantsUomFilter"
                            name="variants_uom_filter"
                            value={uomFilter}
                            onChange={onUomChange}
                            options={[
                                { value: '', label: 'Todas' },
                                ...uoms.map(uom => ({ value: uom.id, label: uom.name })),
                            ]}
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xl-4">
                        <label className="form-label small text-muted mb-1" htmlFor="variantsActiveFilter">Estado</label>
                        <AppSelect
                            id="variantsActiveFilter"
                            name="variants_active_filter"
                            value={activeFilter}
                            onChange={onActiveChange}
                            options={[
                                { value: '', label: 'Todas' },
                                { value: 'true', label: 'Solo activas' },
                                { value: 'false', label: 'Solo inactivas' },
                            ]}
                        />
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
