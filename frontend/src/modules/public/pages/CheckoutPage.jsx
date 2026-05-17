import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiMessageCircle,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { publicService } from '../services/publicService';
import { formatPrice } from '../utils/currency';
import { StoreImage } from '../components/StoreImage';
import { getProductMockImage } from '../utils/mockImages';

export const CheckoutPage = () => {
  const cart = useOutletContext();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    shipping_address: '',
    notes: '',
  });
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (event) => {
    setFormData((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!turnstileToken) {
      setError('Por favor completa la verificacion de seguridad');
      return;
    }

    if (cart.items.length === 0) {
      setError('Tu carrito esta vacio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        ...formData,
        turnstile_token: turnstileToken,
        items: cart.items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const response = await publicService.createOrder(orderData);
      setSuccess(response);
      cart.clearCart();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Error al procesar el pedido';

      if (errorData) {
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          const messages = [];

          Object.entries(errorData).forEach(([field, errors]) => {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              messages.push(`${field}: ${errors}`);
            }
          });

          if (messages.length > 0) {
            errorMessage = messages.join('. ');
          }
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="store-success-card">
        <div className="store-success-mark">
          <FiCheck size={38} />
        </div>
        <span className="store-kicker">SOLICITUD ENVIADA</span>
        <h2 className="store-section__title mt-2 mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          Tu pedido está en revisión
        </h2>
        <p className="store-lead mx-auto mb-4">
          Recibimos la orden <strong>{success.order?.short_id}</strong>. Pronto te contactaremos por WhatsApp para confirmar disponibilidad, entrega y el total final.
        </p>

        <div className="store-success-grid">
          <div className="store-info-card">
            <span className="store-info-card__icon"><FiMessageCircle size={16} /></span>
            <div>
              <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Siguiente paso
              </strong>
              <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                Un asesor validará las variantes y coordinará contigo el cierre del pedido.
              </span>
            </div>
          </div>
          <div className="store-info-card">
            <span className="store-info-card__icon"><FiClock size={16} /></span>
            <div>
              <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                Seguimiento ágil
              </strong>
              <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                Tu referencia queda registrada para continuar sin fricciones.
              </span>
            </div>
          </div>
        </div>

        <div className="store-btn-group justify-content-center mt-4">
          <Link to="/tienda" className="btn btn-store-primary text-decoration-none">
            Seguir comprando
          </Link>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="store-empty-state">
        <span className="store-kicker">CHECKOUT VACÍO</span>
        <h2 className="store-section__title mt-2 mb-3" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
          No hay productos para solicitar
        </h2>
        <p className="store-lead mx-auto mb-4">
          Explora el catálogo, agrega variantes al carrito y vuelve aquí para enviar tu pedido asistido.
        </p>
        <Link to="/tienda" className="btn btn-store-primary text-decoration-none">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
    <div className="d-grid gap-4">
      <Link to="/tienda" className="btn-store-ghost d-inline-flex align-items-center gap-2 text-decoration-none">
        <FiArrowLeft size={14} /> Seguir comprando
      </Link>

      <section className="store-shell store-hero">
        <div className="store-hero__layout">
          <div className="store-hero__content d-grid gap-3">
            <span className="store-kicker">CONFIRMACIÓN DEL PEDIDO</span>
            <h1 className="store-display" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
              Finaliza tu <span>solicitud</span>
            </h1>
            <p className="store-lead mb-0">
              Este checkout funciona como flujo asistido: compartes tus datos, validamos seguridad y coordinamos el cierre final por WhatsApp.
            </p>
          </div>

          <div className="store-hero__aside">
            <div className="store-highlight d-grid gap-3">
              <span className="store-kicker">QUÉ SUCEDE DESPUÉS</span>
              <div className="store-trust-grid">
                <div className="store-info-card">
                  <span className="store-info-card__icon"><FiMessageCircle size={16} /></span>
                  <div>
                    <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Contacto directo
                    </strong>
                    <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                      Te escribimos para validar existencias y entrega.
                    </span>
                  </div>
                </div>
                <div className="store-info-card">
                  <span className="store-info-card__icon"><FiShield size={16} /></span>
                  <div>
                    <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Verificación segura
                    </strong>
                    <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                      La solicitud se protege antes del flujo operativo.
                    </span>
                  </div>
                </div>
                <div className="store-info-card">
                  <span className="store-info-card__icon"><FiTruck size={16} /></span>
                  <div>
                    <strong className="d-block text-body mb-1" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Entrega coordinada
                    </strong>
                    <span className="store-muted" style={{ fontSize: '0.82rem' }}>
                      Confirmamos costo final según zona y disponibilidad.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="store-checkout-layout">
        <section className="store-checkout-card">
          <div className="d-grid gap-4">
            <div>
              <span className="store-kicker">Datos de contacto</span>
              <h2 className="store-section__title mt-2 mb-2">Cuéntanos como prefieres que te contactemos.</h2>
              <p className="store-section__subtitle mb-0">No se realiza cobro en linea. La confirmacion final y el total definitivo se revisan contigo.</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-start gap-2 mb-0">
                <FiAlertCircle className="mt-1 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="store-form-grid">
              <div className="store-form-grid store-form-grid--two">
                <div>
                  <label className="store-form-label" htmlFor="checkoutCustomerName">Nombre completo *</label>
                  <input
                    id="checkoutCustomerName"
                    type="text"
                    name="customer_name"
                    autoComplete="name"
                    className="form-control store-form-control"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="store-form-label" htmlFor="checkoutCustomerPhone">Telefono / WhatsApp *</label>
                  <input
                    id="checkoutCustomerPhone"
                    type="tel"
                    name="customer_phone"
                    autoComplete="tel"
                    className="form-control store-form-control"
                    placeholder="+502 5555-1234"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                  />
                  <div className="store-form-help mt-2">Usaremos este canal para confirmar tu pedido.</div>
                </div>
              </div>

              <div>
                <label className="store-form-label" htmlFor="checkoutCustomerEmail">Email</label>
                <input
                  id="checkoutCustomerEmail"
                  type="email"
                  name="customer_email"
                  autoComplete="email"
                  className="form-control store-form-control"
                  value={formData.customer_email}
                  onChange={handleChange}
                />
              </div>

              <div className="store-checkout-section-divider">
                <span>Dirección de entrega</span>
              </div>

              <div>
                <label className="store-form-label" htmlFor="checkoutShippingAddress">Direccion de envio</label>
                <textarea
                  id="checkoutShippingAddress"
                  name="shipping_address"
                  autoComplete="street-address"
                  className="form-control store-form-textarea"
                  value={formData.shipping_address}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div>
                <label className="store-form-label" htmlFor="checkoutNotes">Notas adicionales</label>
                <textarea
                  id="checkoutNotes"
                  name="notes"
                  autoComplete="off"
                  className="form-control store-form-textarea"
                  placeholder="Horario ideal, referencias, instrucciones especiales..."
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="store-panel">
                <span className="store-kicker">Seguridad</span>
                <h3 className="store-card__title mt-2 mb-2">Verifica tu solicitud</h3>
                <p className="store-muted mb-3">Esto protege el formulario antes de enviarlo al flujo operativo del ERP.</p>
                <TurnstileWidget
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    setError(null);
                  }}
                  onError={(message) => setError(message)}
                />
              </div>

              <button type="submit" className="btn btn-store-primary w-100 d-flex align-items-center justify-content-center gap-2" disabled={loading || !turnstileToken}>
                {loading ? (
                  <>
                    <span className="store-spinner" aria-hidden="true" />
                    Procesando…
                  </>
                ) : (
                  <>
                    <FiCheck size={15} />
                    Enviar pedido
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <aside className="store-summary-card">
          <div>
            <span className="store-kicker">Resumen</span>
            <h2 className="store-summary-card__title mt-2">Pedido listo para enviar</h2>
          </div>

          <div className="store-order-summary">
            {cart.items.map((item) => (
              <article key={item.variant_id} className="store-summary-item">
                <div className="store-summary-item__media">
                  <StoreImage src={getProductMockImage(item.product_id, `checkout-${item.variant_id}`)} alt={item.product_name} />
                </div>

                <div className="d-grid gap-2">
                  <div>
                    <h4 className="store-card__title fs-6 mb-1">{item.product_name}</h4>
                    <div className="store-card__meta">
                      {item.size_name && <span>Talla {item.size_name}</span>}
                      {item.color_name && <span>Color {item.color_name}</span>}
                    </div>
                  </div>

                  <div className="store-summary-line">
                    <span className="store-muted">Cantidad x{item.quantity}</span>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="store-summary-line pt-2">
            <span className="store-kicker">Total estimado</span>
            <div className="store-price"><strong>{formatPrice(cart.getTotalAmount())}</strong></div>
          </div>

          <div className="store-info-card">
            <span className="store-info-card__icon"><FiClock size={18} /></span>
            <div>
              <strong className="d-block text-body mb-1">Sin cobro inmediato</strong>
              <span className="store-muted">El monto final puede ajustarse segun stock, entrega y coordinacion por WhatsApp.</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
    </div>
  );
};
