import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiLayers, FiUser } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';
import { StoreImage } from './StoreImage';
import { getProductMockImage } from '../utils/mockImages';

export const ProductCard = ({ product }) => {
  return (
    <article className="store-card h-100 d-flex flex-column">
      <Link to={`/tienda/producto/${product.id}`} className="text-decoration-none">
        <div className="store-card__media">
          <StoreImage src={getProductMockImage(product.id, 'card')} alt={product.name}>
            <div className="store-image-caption">
              <div className="d-flex align-items-end justify-content-between gap-2">
                <span className="store-pill" style={{ fontSize: '10px', padding: '6px 10px' }}>
                  {product.category_name}
                </span>
                <span className={`store-stock-pill ${product.has_stock ? 'is-available' : 'is-unavailable'}`}
                      style={{ fontSize: '10px', padding: '6px 10px' }}>
                  {product.has_stock ? 'Stock' : 'Agotado'}
                </span>
              </div>
            </div>
          </StoreImage>
        </div>
      </Link>

      <div className="store-card__body d-flex flex-column" style={{ flex: 1 }}>
        <div className="store-card__top align-items-start mb-3">
          <div>
            <h3 className="store-card__title mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              {product.name}
            </h3>
            {product.description && (
              <p className="store-card__copy mb-0" style={{ fontSize: '0.82rem', lineHeight: 1.45 }}>
                {product.description.substring(0, 95)}
                {product.description.length > 95 && '...'}
              </p>
            )}
          </div>
          <FiArrowUpRight size={16} className="text-muted flex-shrink-0" style={{ opacity: 0.5 }} />
        </div>

        {product.entrepreneur_name && (
          <div className="store-card__meta mb-3">
            <span className="d-inline-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
              <FiUser size={12} /> {product.entrepreneur_name}
            </span>
          </div>
        )}

        <div className="store-card__footer mt-auto">
          <div className="store-card__bottom align-items-end mb-3">
            <div className="store-price" style={{ fontFamily: 'var(--font-display)' }}>
              Desde <strong>{formatPrice(product.min_price)}</strong>
            </div>
            <div className="store-card__meta">
              <span className="d-inline-flex align-items-center gap-2" style={{ fontSize: '0.8rem' }}>
                <FiLayers size={12} /> {product.variant_count}
              </span>
            </div>
          </div>

          <Link to={`/tienda/producto/${product.id}`} className="btn btn-store-secondary store-card__cta text-decoration-none btn-sm">
            Ver detalles
            <FiArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
};
