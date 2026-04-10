import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FiLogIn, FiMessageCircle, FiMoon, FiShield, FiSun, FiTerminal, FiTruck } from 'react-icons/fi';
import { useTheme } from '~/core/theme/ThemeContext';
import { CartIcon } from '../components/CartIcon';
import { CartDrawer } from '../components/CartDrawer';
import { useCart } from '../hooks/useCart';
import '../public-store.css';
import '../public-store-refinements.css';

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
              <FiTerminal size={18} strokeWidth={2.5} />
            </span>
            <span>
              <span className="public-nav__eyebrow">ERP SYSTEM</span>
              <span className="public-nav__title">Tienda Pública</span>
              <span className="public-nav__meta">Pedidos asistidos con seguimiento por WhatsApp</span>
            </span>
          </Link>

          <div className="public-nav__actions">
            <Link to="/tienda" className="public-nav__link">
              Catálogo
            </Link>
            <button
              type="button"
              className="store-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
              {theme === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
            </button>
            <Link to="/login" className="btn btn-store-secondary d-none d-sm-inline-flex btn-sm">
              <FiLogIn size={14} />
              Panel Admin
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

      <footer className="public-store__footer mt-auto">
        <div className="public-footer">
          <div className="public-footer__inner">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '2.5rem',
              fontSize: '0.875rem',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              <div>
                <span className="store-kicker" style={{ opacity: 0.7 }}>EXPERIENCIA</span>
                <h4 className="h6 mt-2 mb-2" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  Flujo asistido y confirmación directa
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--bs-secondary-color)', marginBottom: 0 }}>
                  Una vitrina refinada que simplifica el proceso de pedido con seguimiento profesional.
                </p>
              </div>

              <div>
                <span className="store-kicker mb-2 d-block" style={{ opacity: 0.7 }}>GARANTÍAS</span>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex gap-2 align-items-start">
                    <FiShield size={15} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.7 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Solicitud protegida</strong>
                      <small style={{ opacity: 0.75, fontSize: '0.8rem' }}>Validación y confirmación manual</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <FiMessageCircle size={15} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.7 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Atención directa</strong>
                      <small style={{ opacity: 0.75, fontSize: '0.8rem' }}>Coordinación por WhatsApp</small>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="store-kicker mb-2 d-block" style={{ opacity: 0.7 }}>SISTEMA</span>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex gap-2 align-items-start">
                    <FiTruck size={15} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.7 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Entrega coordinada</strong>
                      <small style={{ opacity: 0.75, fontSize: '0.8rem' }}>Costo final según disponibilidad</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2 align-items-start">
                    <FiTerminal size={15} style={{ marginTop: '2px', flexShrink: 0, opacity: 0.7 }} />
                    <div>
                      <strong className="d-block" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Diseño cohesivo</strong>
                      <small style={{ opacity: 0.75, fontSize: '0.8rem' }}>Mismo lenguaje visual del ERP</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3" style={{ 
              borderTop: '1px solid var(--bs-border-color)',
              fontSize: '0.75rem',
              opacity: 0.6,
              textAlign: 'center',
              maxWidth: '1400px',
              margin: '0 auto',
              fontFamily: 'var(--font-mono)'
            }}>
              &copy; {new Date().getFullYear()} Sistema ERP · Imágenes mock temporales
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
