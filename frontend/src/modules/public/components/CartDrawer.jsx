import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiMessageCircle, FiMinus, FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { formatPrice } from '../utils/currency';
import { StoreImage } from './StoreImage';
import { getProductMockImage } from '../utils/mockImages';

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemoveItem,
  totalAmount 
}) => {
  if (!isOpen) return null;

  return (
    <div className="store-cart-sheet">
      <div className="store-cart-sheet__backdrop" onClick={onClose} />

      <aside className="store-cart-sheet__panel" aria-label="Carrito de compras">
        <div className="store-cart-sheet__header">
          <div className="store-inline-between align-items-start">
            <div>
              <span className="store-kicker">Pedido en curso</span>
              <h3 className="store-section__title mt-2 mb-1">Carrito de compras</h3>
              <p className="store-muted mb-0">{items.length} item{items.length !== 1 ? 's' : ''} listos para confirmar.</p>
            </div>
            <button className="store-icon-btn" onClick={onClose} aria-label="Cerrar carrito">
              <FiX size={18} />
            </button>
          </div>

          <div className="store-pill mt-3">
            <FiMessageCircle size={12} /> Confirmamos todo por WhatsApp antes de cerrar el pedido.
          </div>
        </div>

        <div className="store-cart-sheet__content">
          {items.length === 0 ? (
            <div className="store-empty-state">
              <span className="store-kicker">Sin seleccion</span>
              <h3 className="store-section__title mt-2 mb-3">Tu carrito aun esta vacio.</h3>
              <p className="store-lead mx-auto mb-4">
                Explora el catalogo, descubre variantes y agrega piezas para armar tu siguiente pedido.
              </p>
              <Link to="/tienda" className="btn btn-store-primary text-decoration-none" onClick={onClose}>
                Ver productos
                <FiArrowRight size={16} />
              </Link>
            </div>
          ) : (
            items.map(item => (
              <article key={item.variant_id} className="store-cart-item">
                <div className="store-cart-item__media">
                  <StoreImage src={getProductMockImage(item.product_id, `cart-${item.variant_id}`)} alt={item.product_name} />
                </div>

                <div className="d-grid gap-3">
                  <div className="store-cart-item__header align-items-start">
                    <div>
                      <h4 className="store-card__title fs-6 mb-1">{item.product_name}</h4>
                      <div className="store-card__meta">
                        {item.size_name && <span>Talla {item.size_name}</span>}
                        {item.color_name && <span>Color {item.color_name}</span>}
                        <span>{formatPrice(item.price)}</span>
                      </div>
                    </div>
                    <button
                      className="btn-store-ghost text-danger"
                      onClick={() => onRemoveItem(item.variant_id)}
                      aria-label={`Eliminar ${item.product_name}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="store-cart-item__footer">
                    <div className="store-cart-qty">
                      <button onClick={() => onUpdateQuantity(item.variant_id, item.quantity - 1)} aria-label="Reducir cantidad">
                        <FiMinus size={14} />
                      </button>
                      <span className="px-2 fw-semibold">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.variant_id, item.quantity + 1)} aria-label="Aumentar cantidad">
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <div className="store-price"><strong>{formatPrice(item.price * item.quantity)}</strong></div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="store-cart-sheet__footer">
            <div className="store-summary-line mb-3">
              <div>
                <span className="store-kicker">Total estimado</span>
                <div className="store-price mt-2"><strong>{formatPrice(totalAmount)}</strong></div>
              </div>
              <p className="store-summary-meta mb-0">El monto final se confirma segun disponibilidad y coordinacion.</p>
            </div>

            <Link to="/tienda/checkout" className="btn btn-store-primary w-100 text-decoration-none" onClick={onClose}>
              Proceder al checkout
              <FiArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
};
