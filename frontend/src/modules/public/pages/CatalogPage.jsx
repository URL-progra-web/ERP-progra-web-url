import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiTerminal,
  FiFilter,
  FiSearch,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import { usePublicProducts } from '../hooks/usePublicProducts';
import { useFilters } from '../hooks/useFilters';
import { ProductCard } from '../components/ProductCard';
import { CategoryTree } from '../components/CategoryTree';
import { FilterSidebar } from '../components/FilterSidebar';
import { Breadcrumb } from '../components/Breadcrumb';
import { StorefrontLoader } from '../components/StorefrontLoader';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { getAmbientStoreImages, getProductMockImage } from '../utils/mockImages';

const CatalogSkeletonGrid = () => (
  <div className="store-skeleton-grid">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="store-skeleton-card">
        <div className="store-skeleton-card__media" />
        <div className="store-skeleton-card__body">
          <div className="store-skeleton-card__line is-sm" />
          <div className="store-skeleton-card__line is-lg" />
          <div className="store-skeleton-card__line" />
          <div className="store-skeleton-card__line is-md" />
          <div className="store-skeleton-card__line is-sm mb-0" />
        </div>
      </div>
    ))}
  </div>
);

export const CatalogPage = () => {
  const {
    products,
    categoriesTree,
    categoryPath,
    loading,
    error,
    params,
    setCategory,
    setSearch,
    applyFilters,
    clearFilters: clearProductFilters,
  } = usePublicProducts();

  const {
    filters,
    loading: filtersLoading,
    selectedFilters,
    toggleSize,
    toggleColor,
    setPriceRange,
    clearFilters: clearVariantFilters,
    getFilterParams,
    hasActiveFilters,
  } = useFilters(params.category);

  const [searchInput, setSearchInput] = useState(params.search || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const filterParams = getFilterParams();
    applyFilters(filterParams);
  }, [selectedFilters, getFilterParams, applyFilters]);

  useEffect(() => {
    setSearchInput(params.search || '');
  }, [params.search]);

  const previewImageUrls = useMemo(
    () => [
      ...getAmbientStoreImages(),
      ...products.slice(0, 6).map((product) => getProductMockImage(product.id, 'card')),
    ],
    [products],
  );

  const { loaded: imagesReady, progress } = useImagePreloader(
    previewImageUrls,
    !loading && !error && products.length > 0,
  );

  const activeFilterCount =
    selectedFilters.sizes.length +
    selectedFilters.colors.length +
    Number(selectedFilters.minPrice !== null || selectedFilters.maxPrice !== null);

  const selectedCategoryLabel = categoryPath[categoryPath.length - 1]?.name || 'colecciones vivas';
  const leadingCategories = categoriesTree.slice(0, 3);

  const activeChips = [
    ...selectedFilters.sizes.map((sizeId) => {
      const size = filters.sizes.find((item) => item.id === sizeId);
      return size
        ? {
            key: `size-${sizeId}`,
            label: `Talla ${size.name}`,
            onRemove: () => toggleSize(sizeId),
          }
        : null;
    }),
    ...selectedFilters.colors.map((colorId) => {
      const color = filters.colors.find((item) => item.id === colorId);
      return color
        ? {
            key: `color-${colorId}`,
            label: `Color ${color.name}`,
            onRemove: () => toggleColor(colorId),
          }
        : null;
    }),
    (selectedFilters.minPrice !== null || selectedFilters.maxPrice !== null)
      ? {
          key: 'price-range',
          label: `Precio Q${selectedFilters.minPrice || 0} - Q${selectedFilters.maxPrice || '∞'}`,
          onRemove: () => setPriceRange(null, null),
        }
      : null,
  ].filter(Boolean);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  const handleCategorySelect = (categoryId) => {
    setCategory(categoryId);
    clearVariantFilters();
  };

  const handleClearAllFilters = () => {
    clearVariantFilters();
    clearProductFilters();
  };

  const showVisualLoader = !loading && !error && products.length > 0 && !imagesReady;

  return (
    <>
      <style>{`
        .store-catalog-page {
          padding: 0 !important;
          margin: 0 !important;
        }
      `}</style>
      <div className="store-catalog-page" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        width: '100%'
      }}>
        <StorefrontLoader
          visible={showVisualLoader}
          progress={progress}
          label="Cargando interfaz de tienda"
        />

        {/* CONTENIDO PRINCIPAL - Filtros (2/8) + (Buscador + Grid) (6/8) */}
      <main style={{ 
        flex: 1,
        display: 'flex',
        width: '100%',
        minHeight: 'calc(100vh - 60px)'
      }}>
        {/* SIDEBAR IZQUIERDA - Navegación y Filtros */}
        <aside className="d-none d-lg-flex" style={{
          width: '280px',
          minWidth: '280px',
          borderRight: '1px solid var(--bs-border-color, #dee2e6)',
          backgroundColor: 'var(--bs-body-bg, #fff)',
          padding: '1.5rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          overflowY: 'auto',
          position: 'sticky',
          top: 0,
          height: '100vh'
        }}>
          {/* Navegación por categorías */}
          <div>
            <h3 className="store-kicker mb-3" style={{ 
              fontSize: '0.7rem', 
              letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)'
            }}>
              CATEGORÍAS
            </h3>
            <CategoryTree
              categories={categoriesTree}
              selectedId={params.category ? Number(params.category) : null}
              onSelect={handleCategorySelect}
            />
          </div>

          {/* Divisor */}
          <div style={{
            height: '1px',
            backgroundColor: 'var(--bs-border-color, #dee2e6)',
            margin: '0'
          }} />

          {/* Filtros */}
          <div>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="store-kicker mb-0" style={{ 
                fontSize: '0.7rem', 
                letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)'
              }}>
                FILTROS
              </h3>
              {hasActiveFilters && (
                <button 
                  type="button" 
                  className="btn btn-link p-0 text-decoration-none" 
                  onClick={handleClearAllFilters}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  <FiX size={12} className="me-1" />
                  Limpiar
                </button>
              )}
            </div>

            {filtersLoading ? (
              <div className="store-muted" style={{ fontSize: '0.8rem' }}>Cargando filtros...</div>
            ) : (
              <FilterSidebar
                filters={filters}
                selectedFilters={selectedFilters}
                onToggleSize={toggleSize}
                onToggleColor={toggleColor}
                onPriceChange={setPriceRange}
                onClearFilters={handleClearAllFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </div>
        </aside>

        {/* CONTENIDO PRINCIPAL - Búsqueda + Grid de productos */}
        <section style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minWidth: 0
        }}>
          {/* Cabecera con búsqueda - sin fondo, flotante */}
          <div style={{ 
            padding: '1rem 1.5rem 0.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <Breadcrumb path={categoryPath} onNavigate={handleCategorySelect} />

            <form onSubmit={handleSearch} className="store-search mt-3">
              <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch">
                <div className="flex-grow-1 position-relative">
                  <label className="visually-hidden" htmlFor="catalogSearchInput">
                    Buscar productos por nombre
                  </label>
                  <FiSearch size={16} className="store-search__icon" />
                  <input
                    id="catalogSearchInput"
                    type="text"
                    name="catalog_search"
                    autoComplete="off"
                    className="form-control form-control-sm"
                    placeholder="Buscar productos por nombre..."
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    style={{ paddingLeft: '44px' }}
                  />
                </div>

                {searchInput && (
                  <button
                    type="button"
                    className="btn btn-store-secondary btn-sm"
                    onClick={() => {
                      setSearchInput('');
                      setSearch('');
                    }}
                    aria-label="Limpiar búsqueda"
                  >
                    <FiX size={14} />
                  </button>
                )}

                <button type="submit" className="btn btn-store-primary btn-sm">
                  <FiArrowRight size={14} className="me-1" />
                  Buscar
                </button>

                <button
                  type="button"
                  className="btn btn-store-secondary btn-sm d-lg-none"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <FiFilter size={14} className="me-1" />
                  Filtros
                  {hasActiveFilters && (
                    <span className="badge bg-primary rounded-pill ms-1" style={{ fontSize: '0.625rem' }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Área de productos con scroll */}
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 1.5rem 2rem'
          }}>
            {/* Cabecera de resultados */}
            <div className="store-section__header mb-3">
              <div>
                <span className="store-kicker">
                  <FiSliders size={11} /> CATÁLOGO ACTIVO
                </span>
                <h2 className="store-section__title mt-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                  {params.category ? categoryPath[categoryPath.length - 1]?.name : 'Toda la colección'}
                </h2>
                <p className="store-section__subtitle mb-0" style={{ fontSize: '0.875rem' }}>
                  {products.length} producto{products.length !== 1 ? 's' : ''} {params.search ? `para "${params.search}"` : 'disponibles'}
                </p>
              </div>
            </div>

            {/* Chips de filtros activos */}
            {activeChips.length > 0 && (
              <div className="store-chip-row mb-3">
                {activeChips.map((chip) => (
                  <div key={chip.key} className="store-chip">
                    <span>{chip.label}</span>
                    <button type="button" onClick={chip.onRemove} aria-label={`Quitar ${chip.label}`}>
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Grid de productos o estados vacíos */}
            <div className="mt-4">
              {loading && <CatalogSkeletonGrid />}

              {error && (
                <div className="store-empty-state">
                  <span className="store-kicker">ERROR DE CARGA</span>
                  <h3 className="store-section__title mt-2 mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                    No pudimos cargar el catálogo
                  </h3>
                  <p className="store-lead mx-auto mb-4">{error}</p>
                  <button type="button" className="btn btn-store-primary" onClick={handleClearAllFilters}>
                    Reintentar limpiando filtros
                  </button>
                </div>
              )}

              {!loading && !error && (
                <>
                  {products.length === 0 ? (
                    <div className="store-empty-state">
                      <span className="store-kicker">SIN RESULTADOS</span>
                      <h3 className="store-section__title mt-2 mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                        No encontramos productos
                      </h3>
                      <p className="store-lead mx-auto mb-4">
                        Intenta con otro término de búsqueda o reinicia los filtros para ver el catálogo completo.
                      </p>
                      <div className="store-btn-group justify-content-center">
                        {hasActiveFilters && (
                          <button type="button" className="btn btn-store-primary" onClick={handleClearAllFilters}>
                            Limpiar filtros
                          </button>
                        )}
                        <button type="button" className="btn btn-store-secondary" onClick={() => setSearch('')}>
                          Ver todo el catálogo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="store-card-grid">
                      {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
    </main>

    {/* Panel móvil de filtros */}
    {showMobileFilters && (
        <div className="store-cart-sheet d-lg-none">
          <div className="store-cart-sheet__backdrop" onClick={() => setShowMobileFilters(false)} />
          <aside className="store-cart-sheet__panel" aria-label="Filtros del catalogo">
            <div className="store-cart-sheet__header">
              <div className="store-inline-between align-items-start">
                <div>
                  <span className="store-kicker">Exploracion movil</span>
                  <h3 className="store-section__title mt-2 mb-1">Filtros y categorias</h3>
                  <p className="store-muted mb-0">Ajusta la vista del catalogo sin salir de la experiencia.</p>
                </div>
                <button className="store-icon-btn" onClick={() => setShowMobileFilters(false)} aria-label="Cerrar filtros">
                  <FiX size={18} />
                </button>
              </div>
            </div>

            <div className="store-cart-sheet__content">
              <div className="store-panel mb-3">
                <CategoryTree
                  categories={categoriesTree}
                  selectedId={params.category ? Number(params.category) : null}
                  onSelect={(categoryId) => {
                    handleCategorySelect(categoryId);
                    setShowMobileFilters(false);
                  }}
                />
              </div>

              <div className="store-panel">
                <FilterSidebar
                  filters={filters}
                  selectedFilters={selectedFilters}
                  onToggleSize={toggleSize}
                  onToggleColor={toggleColor}
                  onPriceChange={setPriceRange}
                  onClearFilters={handleClearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />
              </div>
            </div>

            <div className="store-cart-sheet__footer">
              <button type="button" className="btn btn-store-primary w-100" onClick={() => setShowMobileFilters(false)}>
                Ver {products.length} producto{products.length !== 1 ? 's' : ''}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
    </>
  );
};
