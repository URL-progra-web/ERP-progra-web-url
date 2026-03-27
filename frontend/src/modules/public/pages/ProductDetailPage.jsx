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
        <span className="store-kicker">Producto no disponible</span>
        <h2 className="store-section__title mt-2 mb-3">No pudimos abrir este detalle.</h2>
        <p className="store-lead mx-auto mb-4">{error || 'Producto no encontrado'}</p>
        <Link to="/tienda" className="btn btn-store-primary text-decoration-none">
          <FiArrowLeft size={16} />
          Volver al catalogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
    <div className="store-detail">
      <Link to="/tienda" className="btn-store-ghost d-inline-flex align-items-center gap-2 text-decoration-none">
        <FiArrowLeft size={16} /> Volver al catalogo
      </Link>

      <section className="store-detail__top">
        <div className="store-shell store-gallery position-relative">
          <StorefrontLoader
            visible={!galleryPreload.loaded}
            progress={galleryPreload.progress}
            label="Preparando galeria visual"
          />

          <div className="store-gallery__hero">
            <StoreImage src={selectedImage} alt={product.name} priority>
              <div className="store-image-caption d-grid gap-2">
                <span className="store-pill">{product.category_name}</span>
                {product.entrepreneur_name && (
                  <span className="d-inline-flex align-items-center gap-2 text-white-50">
                    <FiUser size={14} /> {product.entrepreneur_name}
                  </span>
                )}
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

        <div className="store-shell store-product-panel">
          <div className="store-product-panel__header">
            <div className="store-chip-row">
              <span className="store-pill">{product.category_name}</span>
              <span className={`store-status-pill ${selectedVariant?.is_available ? 'is-available' : 'is-unavailable'}`}>
                {selectedVariant?.is_available ? 'Disponible' : 'Sin stock'}
              </span>
            </div>

            <div>
              <h1 className="store-product-panel__title">{product.name}</h1>
              {product.entrepreneur_name && (
                <div className="store-meta-list mt-3">
                  <span className="d-inline-flex align-items-center gap-2">
                    <FiUser size={14} /> Vendido por <strong className="text-body">{product.entrepreneur_name}</strong>
                  </span>
                </div>
              )}
            </div>

            <p className="store-lead mb-0">{product.description || 'Este producto estara acompañado por una descripcion mas completa cuando el catalogo finalice su integracion.'}</p>
          </div>

          {product.variants?.length > 0 && (
            <div className="d-grid gap-3">
              <div>
                <span className="store-form-label">Seleccionar variante</span>
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
                        <span className="store-option__title">
                          {variant.color_hex && <span className="store-swatch" style={{ backgroundColor: variant.color_hex }} />}
                          <span>{variantLabel}</span>
                        </span>
                        <small className="d-block mt-2 text-muted">
                          {variant.is_available ? formatPrice(variant.price) : 'Sin stock disponible'}
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
                <span className="store-form-label">Precio estimado</span>
                <div className="store-price display-6 mb-0">
                  <strong>{formatPrice(selectedVariant.price)}</strong>
                </div>
              </div>

              <div className="store-pill">
                SKU {selectedVariant.sku || 'N/A'}
              </div>
            </div>
          )}

          <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch">
            <div className="store-quantity">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reducir cantidad">
                <FiMinus size={16} />
              </button>
              <input
                type="number"
                className="store-quantity-input text-center"
                value={quantity}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                min="1"
              />
              <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Aumentar cantidad">
                <FiPlus size={16} />
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
                  <FiCheck size={16} /> Agregado al carrito
                </>
              ) : (
                <>
                  <FiShoppingCart size={16} /> Agregar al carrito
                </>
              )}
            </button>
          </div>

          <div className="store-trust-grid">
            <div className="store-info-card">
              <span className="store-info-card__icon"><FiMessageCircle size={18} /></span>
              <div>
                <strong className="d-block text-body mb-1">Pedido asistido</strong>
                <span className="store-muted">Te contactamos por WhatsApp para confirmar cantidades, entrega y seguimiento.</span>
              </div>
            </div>

            <div className="store-info-card">
              <span className="store-info-card__icon"><FiShield size={18} /></span>
              <div>
                <strong className="d-block text-body mb-1">Solicitud protegida</strong>
                <span className="store-muted">La orden publica usa validacion segura antes de enviarse al equipo operativo.</span>
              </div>
            </div>

            <div className="store-info-card">
              <span className="store-info-card__icon"><FiClock size={18} /></span>
              <div>
                <strong className="d-block text-body mb-1">Respuesta agil</strong>
                <span className="store-muted">El equipo revisa disponibilidad y ajusta detalles del pedido final contigo.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-4">
        <div className="col-lg-7">
          <section className="store-panel h-100">
            <span className="store-kicker">Descripcion</span>
            <h2 className="store-section__title mt-2 mb-3">Contexto del producto</h2>
            <p className="store-lead mb-0">
              {product.description || 'La ficha tecnica completa y el storytelling final se conectaran cuando el backend entregue imagenes y contenido editorial definitivo.'}
            </p>
          </section>
        </div>

        <div className="col-lg-5">
          <section className="store-panel h-100 d-grid gap-3">
            <span className="store-kicker">Datos operativos</span>
            <div className="store-summary-line">
              <span className="store-muted">Unidad base</span>
              <strong>{product.base_uom_name || 'Unidad'}</strong>
            </div>
            <div className="store-summary-line">
              <span className="store-muted">Variantes publicas</span>
              <strong>{product.variants?.length || 0}</strong>
            </div>
            <div className="store-summary-line">
              <span className="store-muted">Estado actual</span>
              <strong>{selectedVariant?.is_available ? 'Disponible' : 'Pendiente de stock'}</strong>
            </div>
            <div className="store-info-card mt-2">
              <span className="store-info-card__icon"><FiPackage size={18} /></span>
              <div>
                <strong className="d-block text-body mb-1">Imagenes mock temporales</strong>
                <span className="store-muted">La galeria usa imagenes aleatorias de apoyo mientras llega la capa de media real desde backend.</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
};
