import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { FiMenu, FiBell, FiLogOut, FiSun, FiMoon, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const Topbar = ({ onMenuClick, onSidebarSizeToggle, isSidebarCollapsed }) => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-body border-bottom d-flex align-items-center justify-content-between px-4" style={{ height: 'var(--topbar-height)', position: 'sticky', top: 0, zIndex: 999 }}>
            {/* Left side: Navigation controls */}
            <div className="d-flex align-items-center">
                <button className="btn btn-link text-muted p-0 d-md-none me-3" onClick={onMenuClick}>
                    <FiMenu size={24} />
                </button>
                <button 
                    className="btn d-none d-md-inline-flex align-items-center gap-2 me-3"
                    onClick={onSidebarSizeToggle}
                    title={isSidebarCollapsed ? 'Expandir menú' : 'Reducir menú'}
                    style={{
                        backgroundColor: 'var(--bs-secondary-bg)',
                        border: '1px solid var(--bs-border-color)',
                        color: 'var(--bs-body-color)',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bs-tertiary-bg)';
                        e.currentTarget.style.borderColor = 'var(--primary)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bs-secondary-bg)';
                        e.currentTarget.style.borderColor = 'var(--bs-border-color)';
                    }}
                >
                    {isSidebarCollapsed ? <FiChevronsRight size={18} /> : <FiChevronsLeft size={18} />}
                    <span>
                        {isSidebarCollapsed ? 'Expandir' : 'Compactar'}
                    </span>
                </button>
                <span className="fw-bold tracking-wide" style={{ letterSpacing: '0.5px' }}>
                    Dashboard
                </span>
            </div>

            {/* Right side: Theme Toggle, Notifications, User actions */}
            <div className="d-flex align-items-center">
                <button 
                    className="btn btn-link text-muted p-2 me-2 border-0 shadow-none" 
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
                >
                    {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} className="text-warning" />}
                </button>

                <button className="btn btn-link text-muted p-2 me-2 border-0 shadow-none">
                    <FiBell size={20} />
                </button>

                <div className="dropdown">
                    <button className="btn btn-light btn-sm d-flex align-items-center border" type="button" onClick={logout} title="Cerrar Sesión">
                        <FiLogOut className="me-2 text-danger" size={16} />
                        <span className="fw-bold text-dark small">{user?.name?.split(' ')[0] || 'User'}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
