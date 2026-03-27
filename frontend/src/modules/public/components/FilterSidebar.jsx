import React, { useState, useEffect } from 'react';
import { FiX, FiFilter } from 'react-icons/fi';
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
  
  // Estado local para el slider de precio
  const [localMinPrice, setLocalMinPrice] = useState(price_range.min);
  const [localMaxPrice, setLocalMaxPrice] = useState(price_range.max);

  // Sincronizar con price_range cuando cambie
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
    <div className="store-filter-sidebar">
      <div className="d-flex justify-content-between align-items-center gap-3">
        <div>
          <span className="store-kicker"><FiFilter size={12} /> Refinar</span>
          <h3 className="store-card__title mt-2">Filtros disponibles</h3>
        </div>
        {hasActiveFilters && (
          <button type="button" className="btn-store-ghost" onClick={onClearFilters}>
            <FiX size={14} className="me-1" />
            Limpiar
          </button>
        )}
      </div>

      {sizes.length > 0 && (
        <div className="store-sidebar__section">
          <div>
            <span className="store-form-label">Talla</span>
            <p className="store-muted mb-0">Selecciona variaciones disponibles.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size.id}
                type="button"
                className={`store-filter-pill ${
                  selectedFilters.sizes.includes(size.id)
                    ? 'is-selected'
                    : ''
                }`}
                onClick={() => onToggleSize(size.id)}
              >
                {size.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="store-sidebar__section">
          <div>
            <span className="store-form-label">Color</span>
            <p className="store-muted mb-0">Usa tonos para filtrar mas rapido.</p>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color.id}
                type="button"
                className={`store-filter-pill ${
                  selectedFilters.colors.includes(color.id)
                    ? 'is-selected'
                    : ''
                }`}
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
          <div>
            <span className="store-form-label">Precio</span>
            <p className="store-muted mb-0">Ajusta un rango para esta seleccion.</p>
          </div>

          <div className="d-flex gap-2 flex-column flex-sm-row">
            <div className="flex-fill">
              <label className="store-form-label">Minimo</label>
              <input
                type="number"
                className="form-control store-price-input"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(Number(e.target.value))}
                min={price_range.min}
                max={localMaxPrice}
              />
            </div>
            <div className="flex-fill">
              <label className="store-form-label">Maximo</label>
              <input
                type="number"
                className="form-control store-price-input"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(Number(e.target.value))}
                min={localMinPrice}
                max={price_range.max}
              />
            </div>
          </div>

          <div className="store-pill">
            {formatPrice(localMinPrice)} - {formatPrice(localMaxPrice)}
          </div>

          <div className="store-btn-group">
            <button type="button" className="btn btn-store-primary flex-fill" onClick={handlePriceApply}>
              Aplicar
            </button>
            {(selectedFilters.minPrice !== null || selectedFilters.maxPrice !== null) && (
              <button type="button" className="btn btn-store-secondary" onClick={handlePriceReset}>
                <FiX size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {sizes.length === 0 && colors.length === 0 && (
        <p className="store-muted mb-0">
          No hay filtros disponibles para esta selección.
        </p>
      )}
    </div>
  );
};
