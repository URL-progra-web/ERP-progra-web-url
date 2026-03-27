import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiLayers, FiUser } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';
import { StoreImage } from './StoreImage';
import { getProductMockImage } from '../utils/mockImages';

export const ProductCard = ({ product }) => {
  return (
    <article className="store-card h-100">
      <Link to={`/tienda/producto/${product.id}`} className="text-decoration-none">
        <div className="store-card__media">
          <StoreImage src={getProductMockImage(product.id, 'card')} alt={product.name}>
            <div className="store-image-caption d-flex align-items-end justify-content-between gap-3">
              <span className="store-pill">{product.category_name}</span>
              <span className={`store-stock-pill ${product.has_stock ? 'is-available' : 'is-unavailable'}`}>
                {product.has_stock ? 'Disponible' : 'Sin stock'}
              </span>
            </div>
          </StoreImage>
        </div>
      </Link>

      <div className="store-card__body">
        <div className="store-card__top align-items-start">
          <div>
            <h3 className="store-card__title mb-2">{product.name}</h3>
            <p className="store-card__copy mb-0">
              {product.description?.substring(0, 110)}
              {product.description?.length > 110 && '...'}
            </p>
          </div>
          <FiArrowUpRight size={18} className="text-muted flex-shrink-0" />
        </div>

        {product.entrepreneur_name && (
          <div className="store-card__meta">
            <span className="d-inline-flex align-items-center gap-2"><FiUser size={13} /> {product.entrepreneur_name}</span>
          </div>
        )}

        <div className="store-card__footer mt-auto">
          <div className="store-card__bottom align-items-end">
            <div className="store-price">
              Desde <strong>{formatPrice(product.min_price)}</strong>
            </div>
            <div className="store-card__meta">
              <span className="d-inline-flex align-items-center gap-2"><FiLayers size={13} /> {product.variant_count} variantes</span>
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link to={`/tienda/producto/${product.id}`} className="btn btn-store-secondary store-card__cta text-decoration-none">
              Ver detalles
              <FiArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
