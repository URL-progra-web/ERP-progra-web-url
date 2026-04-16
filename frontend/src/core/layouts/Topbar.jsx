import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { FiMenu, FiBell, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';

/* ── TopbarActions ───────────────────────────────────────── */

const TopbarActions = ({ theme, toggleTheme, user, logout }) => {
    const initials  = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const firstName = user?.name?.split(' ')[0] || 'Usuario';

    return (
        <div className="d-flex align-items-center gap-2">
            <button
                className="topbar-icon-btn"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
                {theme === 'light' ? <FiMoon size={17} /> : <FiSun size={17} />}
            </button>

            <button className="topbar-icon-btn d-none d-sm-flex" aria-label="Notificaciones">
                <FiBell size={17} />
            </button>

            <button className="topbar-user-btn" onClick={logout} title="Cerrar sesión">
                <div className="topbar-avatar">{initials}</div>
                <span className="d-none d-sm-inline">{firstName}</span>
                <FiLogOut size={14} style={{ opacity: 0.6 }} />
            </button>
        </div>
    );
};

/* ── Main Topbar ─────────────────────────────────────────── */

const Topbar = ({ onMenuClick }) => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="topbar">
            <div className="d-flex align-items-center gap-2">
                {/* Mobile hamburger — opens sidebar overlay */}
                <button
                    className="topbar-icon-btn d-flex d-md-none"
                    onClick={onMenuClick}
                    aria-label="Abrir menú"
                >
                    <FiMenu size={18} />
                </button>

                <span
                    className="ms-1"
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '13px',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: 'var(--bs-tertiary-color)',
                    }}
                >
                    Dashboard
                </span>
            </div>

            <TopbarActions theme={theme} toggleTheme={toggleTheme} user={user} logout={logout} />
        </header>
    );
};

export default Topbar;
