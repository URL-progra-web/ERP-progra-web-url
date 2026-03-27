import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { FiCompass, FiLogIn, FiMessageCircle, FiMoon, FiShield, FiSun, FiTruck } from 'react-icons/fi';
import { useTheme } from '~/core/theme/ThemeContext';
import { CartIcon } from '../components/CartIcon';
import { CartDrawer } from '../components/CartDrawer';
import { useCart } from '../hooks/useCart';
import '../public-store.css';

export const PublicLayout = () => {
  const cart = useCart();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="public-store min-vh-100 d-flex flex-column">
      <div className="public-store__grid" aria-hidden="true" />
      <div className="public-store__noise" aria-hidden="true" />

      <header className="public-nav">
        <div className="container public-nav__inner">
          <Link to="/tienda" className="public-nav__brand">
            <span className="public-nav__mark">
              <FiCompass size={20} />
            </span>
            <span>
              <span className="public-nav__eyebrow">Storefront curado</span>
              <span className="public-nav__title">Tienda ERP</span>
              <span className="public-nav__meta">Pedidos asistidos, colecciones vivas y confirmacion por WhatsApp.</span>
            </span>
          </Link>

          <div className="public-nav__actions">
            <Link to="/tienda" className="public-nav__link">
              Explorar
            </Link>
            <button
              type="button"
              className="store-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
            </button>
            <Link to="/login" className="btn btn-store-secondary d-none d-sm-inline-flex">
              <FiLogIn size={16} />
              Iniciar sesion
            </Link>
            <CartIcon count={cart.getTotalItems()} onClick={cart.toggleCart} />
          </div>
        </div>
      </header>

      <main className="public-store__content flex-grow-1">
        <div className="container store-page-block">
          <Outlet context={cart} />
        </div>
      </main>

      <footer className="public-store__footer mt-auto">
        <div className="container">
          <div className="public-footer">
            <div className="public-footer__grid">
              <div className="public-footer__brand">
                <span className="store-kicker">Experiencia guiada</span>
                <h3 className="store-section__title">Una vitrina mas refinada para un flujo de pedido simple y confiable.</h3>
                <p className="store-lead mb-0">
                  Descubre productos, arma tu pedido y nosotros confirmamos disponibilidad, entrega y seguimiento en minutos.
                </p>
              </div>

              <div>
                <span className="store-kicker mb-3">Confianza</span>
                <div className="public-footer__list">
                  <div className="d-flex gap-3 align-items-start">
                    <span className="store-info-card__icon"><FiShield size={18} /></span>
                    <div>
                      <strong className="d-block text-body mb-1">Solicitud protegida</strong>
                      <span>Validacion con Turnstile y confirmacion manual antes del cierre.</span>
                    </div>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <span className="store-info-card__icon"><FiMessageCircle size={18} /></span>
                    <div>
                      <strong className="d-block text-body mb-1">Atencion directa</strong>
                      <span>Coordinamos detalles por WhatsApp para evitar fricciones en el pedido.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="store-kicker mb-3">Operacion</span>
                <div className="public-footer__list">
                  <div className="d-flex gap-3 align-items-start">
                    <span className="store-info-card__icon"><FiTruck size={18} /></span>
                    <div>
                      <strong className="d-block text-body mb-1">Entrega coordinada</strong>
                      <span>Te compartimos costo final, horarios y disponibilidad de despacho.</span>
                    </div>
                  </div>
                  <div className="d-flex gap-3 align-items-start">
                    <span className="store-info-card__icon"><FiCompass size={18} /></span>
                    <div>
                      <strong className="d-block text-body mb-1">Catalogo curado</strong>
                      <span>La tienda mantiene el lenguaje visual del ERP con un frente mucho mas aspiracional.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="public-footer__note">
              &copy; {new Date().getFullYear()} Tienda ERP. Las imagenes son mock editoriales temporales mientras se integra media real desde backend.
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer
        isOpen={cart.isOpen}
        onClose={cart.closeCart}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        totalAmount={cart.getTotalAmount()}
      />
    </div>
  );
};
