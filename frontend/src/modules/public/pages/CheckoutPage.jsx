import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { publicService } from '../services/publicService';
import { formatPrice } from '../utils/currency';

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

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!turnstileToken) {
      setError('Por favor completa la verificación de seguridad');
      return;
    }

    if (cart.items.length === 0) {
      setError('Tu carrito está vacío');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = {
        ...formData,
        turnstile_token: turnstileToken,
        items: cart.items.map(item => ({
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
          // Handle validation errors
          const messages = [];
          for (const [field, errors] of Object.entries(errorData)) {
            if (Array.isArray(errors)) {
              messages.push(`${field}: ${errors.join(', ')}`);
            } else if (typeof errors === 'string') {
              messages.push(`${field}: ${errors}`);
            }
          }
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

  // Mostrar confirmación de éxito
  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                 style={{ width: '80px', height: '80px' }}>
              <FiCheck size={40} />
            </div>
            <h2 className="mb-3">Pedido Enviado</h2>
            <p className="text-muted mb-4">
              Tu pedido <strong>{success.order?.short_id}</strong> ha sido recibido.
              <br />
              Nos pondremos en contacto contigo pronto por WhatsApp para confirmar los detalles.
            </p>
            <Link to="/tienda" className="btn btn-primary">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Carrito vacío
  if (cart.items.length === 0 && !success) {
    return (
      <div className="container py-5 text-center">
        <h2>Tu carrito está vacío</h2>
        <p className="text-muted">Agrega algunos productos antes de continuar</p>
        <Link to="/tienda" className="btn btn-primary">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Link to="/tienda" className="btn btn-link mb-4 ps-0 text-decoration-none">
        <FiArrowLeft className="me-2" /> Seguir comprando
      </Link>

      <h1 className="mb-4">Finalizar Pedido</h1>

      <div className="row">
        {/* Formulario */}
        <div className="col-lg-7 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Datos de Contacto</h5>
              
              {error && (
                <div className="alert alert-danger d-flex align-items-center">
                  <FiAlertCircle className="me-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Nombre completo *</label>
                  <input
                    type="text"
                    name="customer_name"
                    className="form-control"
                    value={formData.customer_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono (WhatsApp) *</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    className="form-control"
                    placeholder="+502 5555-1234"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    required
                  />
                  <small className="text-muted">
                    Te contactaremos por WhatsApp para confirmar tu pedido
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email (opcional)</label>
                  <input
                    type="email"
                    name="customer_email"
                    className="form-control"
                    value={formData.customer_email}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección de envío (opcional)</label>
                  <textarea
                    name="shipping_address"
                    className="form-control"
                    rows="2"
                    value={formData.shipping_address}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Notas adicionales (opcional)</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows="2"
                    placeholder="Instrucciones especiales, horarios de contacto, etc."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                {/* Turnstile */}
                <div className="mb-4">
                  <TurnstileWidget
                    onVerify={setTurnstileToken}
                    onError={(err) => setError(err)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100"
                  disabled={loading || !turnstileToken}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Procesando...
                    </>
                  ) : (
                    'Enviar Pedido'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Resumen del pedido */}
        <div className="col-lg-5">
          <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-body">
              <h5 className="card-title mb-4">Resumen del Pedido</h5>
              
              {cart.items.map(item => (
                <div key={item.variant_id} className="d-flex justify-content-between mb-2">
                  <div>
                    <span>{item.product_name}</span>
                    <small className="text-muted d-block">
                      {item.size_name && item.size_name}
                      {item.size_name && item.color_name && ' - '}
                      {item.color_name && item.color_name}
                      {' x'}{item.quantity}
                    </small>
                  </div>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between fw-bold">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(cart.getTotalAmount())}</span>
              </div>

              <small className="text-muted d-block mt-3">
                * Los precios pueden variar según disponibilidad. 
                Te confirmaremos el total final por WhatsApp.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
