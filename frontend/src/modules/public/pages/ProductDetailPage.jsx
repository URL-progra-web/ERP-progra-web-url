import React, { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiMessageCircle,
  FiMinus,
  FiPackage,
  FiPlus,
  FiShield,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi';
import { publicService } from '../services/publicService';
import { formatPrice } from '../utils/currency';
import { StoreImage } from '../components/StoreImage';
import { StorefrontLoader } from '../components/StorefrontLoader';
import { useImagePreloader } from '../hooks/useImagePreloader';
import { getProductGalleryImages } from '../utils/mockImages';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const cart = useOutletContext();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await publicService.getProduct(id);
        setProduct(data);

        const availableVariant = data.variants?.find((variant) => variant.is_available);
        setSelectedVariant(availableVariant || data.variants?.[0] || null);
      } catch (err) {
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product?.id, selectedVariant?.id]);

  const galleryImages = useMemo(
    () => (product ? getProductGalleryImages(product.id, selectedVariant?.id) : []),
    [product, selectedVariant],
  );

  const selectedImage = galleryImages[activeImageIndex] || galleryImages[0];
  const galleryPreload = useImagePreloader(galleryImages.slice(0, 3), Boolean(product));

  const handleAddToCart = () => {
    if (!selectedVariant || !product) {
      return;
    }

    cart.addItem(selectedVariant, product, quantity);
    setAddedToCart(true);
    window.setTimeout(() => setAddedToCart(false), 2200);
  };

  if (loading) {
    return (
      <div className="store-shell position-relative" style={{ minHeight: '440px' }}>
        <StorefrontLoader visible progress={42} label="Cargando producto" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="store-empty-state">
        <span className="store-kicker">PRODUCTO NO DISPONIBLE</span>
        <h2 className="store-section__title mt-2 mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          No pudimos cargar este producto
        </h2>
        <p className="store-lead mx-auto mb-4">{error || 'Producto no encontrado'}</p>
        <Link to="/tienda" className="btn btn-store-primary text-decoration-none">
          <FiArrowLeft size={14} />
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
    <div className="store-detail">
      <Link to="/tienda" className="btn-store-ghost d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
        <FiArrowLeft size={14} /> Volver al catálogo
      </Link>

      {/* FILA 1: Galería (X) + Panel de Compra (C) */}
      <section className="store-detail__top">
        {/* GALERÍA DE IMÁGENES - Más compacta */}
        <div className="store-shell store-gallery position-relative" style={{ maxWidth: '420px' }}>
          <StorefrontLoader
            visible={!galleryPreload.loaded}
            progress={galleryPreload.progress}
            label="Preparando galeria visual"
          />

          <div className="store-gallery__hero" style={{ aspectRatio: '1', maxHeight: '420px' }}>
            <StoreImage src={selectedImage} alt={product.name} priority>
              <div className="store-image-caption d-grid gap-2">
                <span className="store-pill">{product.category_name}</span>
              </div>
            </StoreImage>
          </div>

          <div className="store-gallery__thumbs">
            {galleryImages.map((image, index) => (
              <button
                key={image}
                type="button"
                className={`store-thumbnail-btn ${activeImageIndex === index ? 'is-active' : ''}`}
                onClick={() => setActiveImageIndex(index)}
                aria-label={`Ver imagen ${index + 1}`}
              >
                <StoreImage src={image} alt={`${product.name} vista ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* PANEL DE PRODUCTO - Para compra */}
        <div className="store-shell store-product-panel">
          <div className="store-product-panel__header">
            <div className="store-chip-row">
              <span className="store-pill" style={{ fontSize: '10px', padding: '6px 10px' }}>
                {product.category_name}
              </span>
              <span className={`store-status-pill ${selectedVariant?.is_available ? 'is-available' : 'is-unavailable'}`}
                    style={{ fontSize: '10px', padding: '6px 10px' }}>
                {selectedVariant?.is_available ? 'Disponible' : 'Agotado'}
              </span>
            </div>

            <div>
              <h1 className="store-product-panel__title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                {product.name}
              </h1>
            </div>
          </div>

          {/* INFORMACIÓN DEL VENDEDOR */}
          {product.entrepreneur_name && (
            <div className="store-info-card" style={{ backgroundColor: 'rgba(var(--bs-primary-rgb), 0.06)' }}>
              <span className="store-info-card__icon"><FiUser size={16} /></span>
              <div>
                <span className="store-kicker mb-1" style={{ fontSize: '9px' }}>VENDIDO POR</span>
                <strong className="d-block text-body" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {product.entrepreneur_name}
                </strong>
              </div>
            </div>
          )}

          {/* SELECTOR DE VARIANTES - Mejorado */}
          {product.variants?.length > 0 && (
            <div className="d-grid gap-3">
              {/* Colores disponibles */}
              {(() => {
                const uniqueColors = [...new Map(
                  product.variants.flatMap(v =>
                    v.color_name ? [[v.color_name, { name: v.color_name, hex: v.color_hex }]] : []
                  )
                ).values()];

                if (uniqueColors.length > 0) {
                  return (
                    <div>
                      <span className="store-form-label" style={{ fontSize: '11px' }}>
                        COLORES DISPONIBLES ({uniqueColors.length})
                      </span>
                      <div className="d-flex gap-2 mt-2 flex-wrap">
                        {uniqueColors.map((color) => {
                          const isSelected = selectedVariant?.color_name === color.name;
                          return (
                            <button
                              key={color.name}
                              type="button"
                              className={`d-flex align-items-center gap-2 px-3 py-2 rounded-3 border ${isSelected ? 'border-primary border-2' : 'border-secondary'}`}
                              style={{ 
                                fontSize: '0.875rem',
                                fontWeight: isSelected ? 600 : 400,
                                backgroundColor: isSelected ? 'rgba(var(--bs-primary-rgb), 0.08)' : 'transparent'
                              }}
                              onClick={() => {
                                const variant = product.variants.find(v => v.color_name === color.name && v.is_available);
                                if (variant) setSelectedVariant(variant);
                              }}
                            >
                              {color.hex && (
                                <span 
                                  className="store-swatch" 
                                  style={{ 
                                    backgroundColor: color.hex,
                                    width: '20px',
                                    height: '20px',
                                    border: '2px solid rgba(var(--bs-border-color-rgb), 0.3)'
                                  }} 
                                />
                              )}
                              <span>{color.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Tallas disponibles */}
              {(() => {
                const uniqueSizes = [...new Set(
                  product.variants.flatMap(v => v.size_name ? [v.size_name] : [])
                )];

                if (uniqueSizes.length > 0) {
                  return (
                    <div>
                      <span className="store-form-label" style={{ fontSize: '11px' }}>
                        TALLAS DISPONIBLES ({uniqueSizes.length})
                      </span>
                      <div className="d-flex gap-2 mt-2 flex-wrap">
                        {uniqueSizes.map((size) => {
                          const isSelected = selectedVariant?.size_name === size;
                          const variant = product.variants.find(v => v.size_name === size);
                          const isAvailable = variant?.is_available;
                          
                          return (
                            <button
                              key={size}
                              type="button"
                              className={`px-3 py-2 rounded-3 border ${isSelected ? 'border-primary border-2' : 'border-secondary'}`}
                              style={{ 
                                fontSize: '0.875rem',
                                fontWeight: isSelected ? 600 : 400,
                                minWidth: '50px',
                                backgroundColor: isSelected ? 'rgba(var(--bs-primary-rgb), 0.08)' : 'transparent',
                                opacity: isAvailable ? 1 : 0.4
                              }}
                              onClick={() => {
                                if (isAvailable && variant) setSelectedVariant(variant);
                              }}
                              disabled={!isAvailable}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Tabla de variantes completa */}
              <div>
                <span className="store-form-label" style={{ fontSize: '11px' }}>
                  TODAS LAS VARIANTES ({product.variants.length})
                </span>
                <div className="store-option-grid mt-2">
                  {product.variants.map((variant) => {
                    const variantLabel = [variant.size_name, variant.color_name].filter(Boolean).join(' - ') || variant.sku;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        className={`store-option ${selectedVariant?.id === variant.id ? 'is-selected' : ''} ${!variant.is_available ? 'is-disabled' : ''}`}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.is_available}
                      >
                        <span className="store-option__title" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                          {variant.color_hex && <span className="store-swatch" style={{ backgroundColor: variant.color_hex }} />}
                          <span>{variantLabel}</span>
                        </span>
                        <small className="d-block mt-2 text-muted" style={{ fontSize: '0.8rem' }}>
                          {variant.is_available ? formatPrice(variant.price) : 'Sin stock'}
                        </small>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {selectedVariant && (
            <div className="store-inline-between align-items-end flex-wrap">
              <div>
                <span className="store-form-label" style={{ fontSize: '11px' }}>Precio unitario</span>
                <div className="store-price display-6 mb-0" style={{ fontFamily: 'var(--font-display)' }}>
                  <strong>{formatPrice(selectedVariant.price)}</strong>
                </div>
              </div>

              <div className="store-pill" style={{ fontSize: '10px', padding: '6px 10px' }}>
                SKU {selectedVariant.sku || 'N/A'}
              </div>
            </div>
          )}

          <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch">
            <div className="store-quantity">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reducir cantidad">
                <FiMinus size={14} />
              </button>
              <input
                id="productDetailQuantityInput"
                type="number"
                name="product_detail_quantity"
                autoComplete="off"
                aria-label="Cantidad a agregar al carrito"
                className="store-quantity-input text-center"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                min="1"
              />
              <button type="button" onClick={() => setQuantity(prev => prev + 1)} aria-label="Aumentar cantidad">
                <FiPlus size={14} />
              </button>
            </div>

            <button
              type="button"
              className="btn btn-store-primary flex-grow-1"
              onClick={handleAddToCart}
              disabled={!selectedVariant?.is_available}
            >
              {addedToCart ? (
                <>
                  <FiCheck size={14} /> Agregado
                </>
              ) : (
                <>
                  <FiShoppingCart size={14} /> Agregar al carrito
                </>
              )}
            </button>
          </div>

          <div className="store-trust-grid">
            <div className="store-info-card">
              <span className="store-info-card__icon"><FiMessageCircle size={16} /></span>
              <div>
                <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Pedido asistido
                </strong>
                <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                  Confirmación por WhatsApp para cantidades, entrega y seguimiento.
                </span>
              </div>
            </div>

            <div className="store-info-card">
              <span className="store-info-card__icon"><FiShield size={16} /></span>
              <div>
                <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Solicitud protegida
                </strong>
                <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                  Validación de seguridad antes del envío al equipo operativo.
                </span>
              </div>
            </div>

            <div className="store-info-card">
              <span className="store-info-card__icon"><FiClock size={16} /></span>
              <div>
                <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  Respuesta ágil
                </strong>
                <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                  Revisión de disponibilidad y ajuste del pedido final.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILA 2: Contexto/Descripción (A) - Debajo de la foto */}
      <section className="store-panel mt-4">
        <span className="store-kicker">DESCRIPCIÓN</span>
        <h2 className="store-section__title mt-2 mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Contexto del producto
        </h2>
        <p className="store-lead mb-0">
          {product.description || 'La ficha técnica completa se conectará cuando el backend integre las imágenes y contenido editorial definitivo.'}
        </p>
      </section>

      {/* FILA 3: Especificaciones Técnicas (Y) - Ancho completo */}
      <section className="store-panel mt-4">
        <div>
          <span className="store-kicker">ESPECIFICACIONES TÉCNICAS</span>
          <h3 className="store-section__title mt-2 mb-4" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>
            Detalles del producto
          </h3>
        </div>

        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="store-summary-line">
              <span className="store-muted" style={{ fontSize: '0.875rem' }}>Categoría</span>
              <strong style={{ fontSize: '0.875rem' }}>{product.category_name}</strong>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="store-summary-line">
              <span className="store-muted" style={{ fontSize: '0.875rem' }}>Unidad base</span>
              <strong style={{ fontSize: '0.875rem' }}>{product.base_uom_name || 'Unidad'}</strong>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="store-summary-line">
              <span className="store-muted" style={{ fontSize: '0.875rem' }}>Variantes disponibles</span>
              <strong style={{ fontSize: '0.875rem' }}>
                {product.variants?.filter(v => v.is_available).length || 0} de {product.variants?.length || 0}
              </strong>
            </div>
          </div>
          <div className="col-md-6 col-lg-3">
            <div className="store-summary-line">
              <span className="store-muted" style={{ fontSize: '0.875rem' }}>Estado actual</span>
              <strong style={{ fontSize: '0.875rem' }}>{selectedVariant?.is_available ? 'Disponible' : 'Pendiente de stock'}</strong>
            </div>
          </div>

          {/* Colores disponibles */}
          {(() => {
            const uniqueColors = [...new Set(product.variants?.flatMap(v => v.color_name ? [v.color_name] : []))];
            if (uniqueColors.length > 0) {
              return (
                <div className="col-md-6 col-lg-4">
                  <div className="store-summary-line">
                    <span className="store-muted" style={{ fontSize: '0.875rem' }}>Colores disponibles</span>
                    <strong style={{ fontSize: '0.875rem' }}>{uniqueColors.join(', ')}</strong>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Tallas disponibles */}
          {(() => {
            const uniqueSizes = [...new Set(product.variants?.flatMap(v => v.size_name ? [v.size_name] : []))];
            if (uniqueSizes.length > 0) {
              return (
                <div className="col-md-6 col-lg-4">
                  <div className="store-summary-line">
                    <span className="store-muted" style={{ fontSize: '0.875rem' }}>Tallas disponibles</span>
                    <strong style={{ fontSize: '0.875rem' }}>{uniqueSizes.join(', ')}</strong>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* Vendedor */}
          {product.entrepreneur_name && (
            <div className="col-md-6 col-lg-4">
              <div className="store-summary-line">
                <span className="store-muted" style={{ fontSize: '0.875rem' }}>Proveedor</span>
                <strong style={{ fontSize: '0.875rem' }}>{product.entrepreneur_name}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="store-info-card mt-4">
          <span className="store-info-card__icon"><FiPackage size={16} /></span>
          <div>
            <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
              Imágenes mock temporales
            </strong>
            <span className="store-muted" style={{ fontSize: '0.82rem' }}>
              La galería usa imágenes de apoyo mientras se integran los medios reales.
            </span>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};
