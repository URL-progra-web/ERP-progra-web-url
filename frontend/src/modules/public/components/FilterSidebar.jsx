import React, { useState, useEffect } from 'react';
import { FiX, FiFilter, FiTag } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';

export const FilterSidebar = ({ 
  filters, 
  selectedFilters, 
  onToggleSize, 
  onToggleColor, 
  onPriceChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  const { sizes, colors, price_range } = filters;
  
  const [localMinPrice, setLocalMinPrice] = useState(price_range.min);
  const [localMaxPrice, setLocalMaxPrice] = useState(price_range.max);

  useEffect(() => {
    if (selectedFilters.minPrice === null) {
      setLocalMinPrice(price_range.min);
    }
    if (selectedFilters.maxPrice === null) {
      setLocalMaxPrice(price_range.max);
    }
  }, [price_range, selectedFilters.minPrice, selectedFilters.maxPrice]);

  const handlePriceApply = () => {
    onPriceChange(localMinPrice, localMaxPrice);
  };

  const handlePriceReset = () => {
    setLocalMinPrice(price_range.min);
    setLocalMaxPrice(price_range.max);
    onPriceChange(null, null);
  };

  return (
    <div className="store-filter-sidebar" style={{ fontSize: '0.875rem' }}>
      {hasActiveFilters && (
        <button type="button" className="btn-store-ghost btn-sm w-100 mb-2" onClick={onClearFilters} style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
          <FiX size={12} className="me-1" />
          Limpiar
        </button>
      )}

      {sizes.length > 0 && (
        <div className="store-sidebar__section" style={{ marginBottom: '0.75rem' }}>
          <span className="store-form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Talla</span>
          <div className="d-flex flex-wrap gap-1">
            {sizes.map(size => (
              <button
                key={size.id}
                type="button"
                className={`store-filter-pill ${
                  selectedFilters.sizes.includes(size.id)
                    ? 'is-selected'
                    : ''
                }`}
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => onToggleSize(size.id)}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="store-sidebar__section" style={{ marginBottom: '0.75rem' }}>
          <span className="store-form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Color</span>
          <div className="d-flex flex-wrap gap-1">
            {colors.map(color => (
              <button
                key={color.id}
                type="button"
                className={`store-filter-pill ${
                  selectedFilters.colors.includes(color.id)
                    ? 'is-selected'
                    : ''
                }`}
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                onClick={() => onToggleColor(color.id)}
                title={color.name}
              >
                {color.hex_code && (
                  <span className="store-filter-pill__swatch" style={{ backgroundColor: color.hex_code }} />
                )}
                <span>{color.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {price_range.max > 0 && (
        <div className="store-sidebar__section">
          <span className="store-form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>Precio</span>

          <div className="d-flex gap-2 mt-1">
            <div className="flex-fill">
              <label className="store-form-label" htmlFor="catalogMinPrice" style={{ fontSize: '0.7rem' }}>Mín</label>
              <input
                id="catalogMinPrice"
                type="number"
                name="catalog_min_price"
                autoComplete="off"
                className="form-control form-control-sm store-price-input"
                style={{ fontSize: '0.8rem' }}
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                min={price_range.min}
                max={localMaxPrice}
              />
            </div>
            <div className="flex-fill">
              <label className="store-form-label" htmlFor="catalogMaxPrice" style={{ fontSize: '0.7rem' }}>Máx</label>
              <input
                id="catalogMaxPrice"
                type="number"
                name="catalog_max_price"
                autoComplete="off"
                className="form-control form-control-sm store-price-input"
                style={{ fontSize: '0.8rem' }}
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                min={localMinPrice}
                max={price_range.max}
              />
            </div>
          </div>

          <div className="store-pill mt-2" style={{ fontSize: '0.75rem', padding: '4px 8px' }}>
            <FiTag size={11} /> {formatPrice(localMinPrice)} — {formatPrice(localMaxPrice)}
          </div>

          <div className="store-btn-group mt-2">
            <button type="button" className="btn btn-store-primary btn-sm flex-fill" style={{ fontSize: '0.75rem' }} onClick={handlePriceApply}>
              Aplicar
            </button>
            {(selectedFilters.minPrice !== null || selectedFilters.maxPrice !== null) && (
              <button type="button" className="btn btn-store-secondary btn-sm" onClick={handlePriceReset}>
                <FiX size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {sizes.length === 0 && colors.length === 0 && (
        <p className="store-muted mb-0" style={{ fontSize: '0.8rem' }}>
          No hay filtros disponibles.
        </p>
      )}
    </div>
  );
};

