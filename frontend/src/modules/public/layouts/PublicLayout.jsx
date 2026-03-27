import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiLogIn, FiMessageCircle, FiMoon, FiShield, FiSun, FiTerminal, FiTruck } from 'react-icons/fi';
import { useTheme } from '~/core/theme/ThemeContext';
import { CartIcon } from '../components/CartIcon';
import { CartDrawer } from '../components/CartDrawer';
import { useCart } from '../hooks/useCart';
import '../public-store.css';

export const PublicLayout = () => {
  const cart = useCart();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // Solo la página del catálogo principal no tiene padding
  const isCatalogPage = location.pathname === '/tienda' && !location.search;

  return (
    <div className="public-store min-vh-100 d-flex flex-column">
      <div className="public-store__grid" aria-hidden="true" />
      <div className="public-store__noise" aria-hidden="true" />

      <header className="public-nav">
        <div className="container public-nav__inner">
          <Link to="/tienda" className="public-nav__brand">
            <span className="public-nav__mark">
              <FiTerminal size={20} />
            </span>
            <span>
              <span className="public-nav__eyebrow">ERP System</span>
              <span className="public-nav__title">Storefront publico</span>
              <span className="public-nav__meta">Pedidos asistidos y confirmacion por WhatsApp dentro del mismo lenguaje visual.</span>
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

      <main className={isCatalogPage ? 'flex-grow-1' : 'public-store__content flex-grow-1'}>
        <div className={isCatalogPage ? '' : 'store-page-block'}>
          <Outlet context={cart} />
        </div>
      </main>

      <footer className="public-store__footer mt-auto" style={{ borderRadius: 0, paddingTop: 0 }}>
        <div className="public-footer" style={{ borderRadius: 0 }}>
          <div className="public-footer__inner" style={{ padding: '2rem 1rem', borderRadius: 0 }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '3rem',
              fontSize: '0.875rem',
              maxWidth: '1400px',
              margin: '0 auto',
              borderRadius: 0
            }}>
              <div>
                <span className="store-kicker" style={{ opacity: 0.7 }}>Experiencia guiada</span>
                <h4 className="h6 mt-2">Una vitrina mas refinada para un flujo de pedido simple y confiable.</h4>
              </div>

              <div>
                <span className="store-kicker mb-2 d-block" style={{ opacity: 0.7 }}>Confianza</span>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex gap-2 align-items-start">
                    <FiShield size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem' }}>Solicitud protegida</strong>
                      <small style={{ opacity: 0.8 }}>Validación y confirmación manual</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <FiMessageCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem' }}>Atención directa</strong>
                      <small style={{ opacity: 0.8 }}>Coordinación por WhatsApp</small>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="store-kicker mb-2 d-block" style={{ opacity: 0.7 }}>Operación</span>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex gap-2 align-items-start">
                    <FiTruck size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem' }}>Entrega coordinada</strong>
                      <small style={{ opacity: 0.8 }}>Costo final y disponibilidad</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <FiTerminal size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem' }}>Misma identidad</strong>
                      <small style={{ opacity: 0.8 }}>Diseño unificado con el dashboard</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3" style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '0.75rem',
              opacity: 0.6,
              textAlign: 'center',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              &copy; {new Date().getFullYear()} Tienda ERP. Imágenes mock temporales.
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
