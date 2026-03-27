import React, { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiCompass,
  FiFilter,
  FiLayers,
  FiSearch,
  FiSliders,
  FiTrendingUp,
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
    <div className="d-grid gap-4">
      <Breadcrumb path={categoryPath} onNavigate={handleCategorySelect} />

      <section className="store-shell store-hero position-relative">
        <StorefrontLoader
          visible={showVisualLoader}
          progress={progress}
          label="Cargando storefront editorial"
        />

        <div className="store-hero__layout">
          <div className="store-hero__content d-grid gap-4">
            <div className="d-grid gap-3">
              <span className="store-kicker">
                <FiCompass size={12} /> Catalogo publico
              </span>

              <div>
                <h1 className="store-display">
                  Descubre <span>{selectedCategoryLabel}</span>
                </h1>
                <p className="store-lead mt-3 mb-0">
                  Una tienda mas atractiva, pulida y atmosferica para explorar productos, variantes y pedidos sin romper el lenguaje visual del ERP.
                </p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="store-search">
              <FiSearch size={18} className="store-search__icon" />
              <div className="d-flex flex-column flex-md-row gap-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Busca por nombre, descripcion o inspiracion..."
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />

                {searchInput && (
                  <button
                    type="button"
                    className="btn btn-store-secondary"
                    onClick={() => {
                      setSearchInput('');
                      setSearch('');
                    }}
                  >
                    <FiX size={16} />
                  </button>
                )}

                <button type="submit" className="btn btn-store-primary">
                  Buscar
                  <FiArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className="btn btn-store-secondary d-lg-none"
                  onClick={() => setShowMobileFilters(true)}
                >
                  <FiFilter size={16} />
                  Filtros
                  {hasActiveFilters && <span className="badge bg-primary rounded-pill">{activeFilterCount}</span>}
                </button>
              </div>
            </form>

            <div className="store-hero__stats">
              <div className="store-metric">
                <span className="store-metric__value">{products.length}</span>
                <span className="store-metric__label">productos visibles</span>
              </div>
              <div className="store-metric">
                <span className="store-metric__value">{categoriesTree.length}</span>
                <span className="store-metric__label">categorias base</span>
              </div>
              <div className="store-metric">
                <span className="store-metric__value">{activeFilterCount}</span>
                <span className="store-metric__label">filtros activos</span>
              </div>
            </div>
          </div>

          <aside className="store-hero__aside">
            <div className="store-highlight d-grid gap-3">
              <span className="store-kicker">
                <FiTrendingUp size={12} /> Curaduria visual
              </span>
              <h3>Una vitrina mas premium, con carga visual progresiva e imagenes mock preparadas para el futuro backend.</h3>
              <p className="mb-0">
                Los productos ya pueden sentirse editoriales aunque la API todavia no exponga media real.
              </p>
            </div>

            <div className="store-panel">
              <div className="d-flex justify-content-between align-items-start gap-3">
                <div>
                  <span className="store-kicker">
                    <FiLayers size={12} /> Destacadas
                  </span>
                  <h3 className="store-card__title mt-2">Rutas rapidas</h3>
                </div>
                <span className="store-pill">{leadingCategories.length}</span>
              </div>

              <div className="store-chip-row mt-2">
                {leadingCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    className="store-chip"
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    {category.name}
                  </button>
                ))}

                {leadingCategories.length === 0 && (
                  <span className="store-muted">Las categorias aparecerán aqui cuando el catalogo tenga estructura publica.</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <div className="store-layout">
        <aside className="store-layout__sidebar d-none d-lg-block">
          <div className="store-layout__sidebar-inner">
            <div className="store-panel">
              <CategoryTree
                categories={categoriesTree}
                selectedId={params.category ? Number(params.category) : null}
                onSelect={handleCategorySelect}
              />
            </div>

            <div className="store-panel">
              {filtersLoading ? (
                <div className="store-muted">Cargando filtros...</div>
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
          </div>
        </aside>

        <section className="store-layout__main store-section">
          <div className="store-section__header">
            <div>
              <span className="store-kicker">
                <FiSliders size={12} /> Resultado actual
              </span>
              <h2 className="store-section__title mt-2">Coleccion disponible</h2>
              <p className="store-section__subtitle mb-0">
                {products.length} producto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}
                {params.search ? ` para "${params.search}"` : ''}.
              </p>
            </div>

            <div className="store-section__actions">
              {hasActiveFilters && (
                <button type="button" className="btn btn-store-secondary" onClick={handleClearAllFilters}>
                  <FiX size={16} /> Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="store-chip-row">
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

          {loading && <CatalogSkeletonGrid />}

          {error && (
            <div className="store-empty-state">
              <span className="store-kicker">Error de carga</span>
              <h3 className="store-section__title mt-2 mb-3">No pudimos cargar el catalogo.</h3>
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
                  <span className="store-kicker">Sin resultados</span>
                  <h3 className="store-section__title mt-2 mb-3">No encontramos productos para esta combinacion.</h3>
                  <p className="store-lead mx-auto mb-4">
                    Prueba otro termino de busqueda o reinicia los filtros para volver al flujo completo del catalogo.
                  </p>
                  <div className="store-btn-group justify-content-center">
                    {hasActiveFilters && (
                      <button type="button" className="btn btn-store-primary" onClick={handleClearAllFilters}>
                        Limpiar filtros
                      </button>
                    )}
                    <button type="button" className="btn btn-store-secondary" onClick={() => setSearch('')}>
                      Ver todo el catalogo
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
        </section>
      </div>

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
  );
};
