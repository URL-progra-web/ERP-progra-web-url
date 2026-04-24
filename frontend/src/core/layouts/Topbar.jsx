import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { FiMenu, FiBell, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { orderService } from '~/modules/orders/orders/services/orderService';
import { getDashboardPath } from '~/core/registry/dashboardPaths';

/* ── TopbarActions ───────────────────────────────────────── */

const TopbarActions = ({ theme, toggleTheme, user, logout }) => {
    const initials  = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const firstName = user?.name?.split(' ')[0] || 'Usuario';
    const navigate = useNavigate();
    const canViewNotifications = ['ADMIN', 'MANAGER'].includes(user?.role?.name);
    const basePath = getDashboardPath(user?.role?.name);
    const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
    const [notifications, setNotifications] = React.useState([]);
    const [notificationCount, setNotificationCount] = React.useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);
    const [notificationsError, setNotificationsError] = React.useState('');
    const notificationsRef = React.useRef(null);

    React.useEffect(() => {
        if (!isNotificationsOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!notificationsRef.current?.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isNotificationsOpen]);

    const loadNotifications = React.useCallback(async () => {
        if (!canViewNotifications) return;

        setIsLoadingNotifications(true);
        setNotificationsError('');
        try {
            const response = await orderService.listNotifications({ page: 1, page_size: 6 });
            setNotifications(Array.isArray(response?.results) ? response.results : []);
            setNotificationCount(Number(response?.count) || 0);
        } catch {
            setNotifications([]);
            setNotificationCount(0);
            setNotificationsError('No se pudieron cargar las notificaciones.');
        } finally {
            setIsLoadingNotifications(false);
        }
    }, [canViewNotifications]);

    const handleToggleNotifications = async () => {
        const nextOpen = !isNotificationsOpen;
        setIsNotificationsOpen(nextOpen);
        if (nextOpen) {
            await loadNotifications();
        }
    };

    const handleOpenOrder = (orderId) => {
        setIsNotificationsOpen(false);
        navigate(`${basePath}/orders/detail/${orderId}`);
    };

    return (
        <div className="d-flex align-items-center gap-2">
            <button
                className="topbar-icon-btn"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
            >
                {theme === 'light' ? <FiMoon size={17} /> : <FiSun size={17} />}
            </button>

            {canViewNotifications && (
                <div className="topbar-notifications" ref={notificationsRef}>
                    <button
                        type="button"
                        className="topbar-icon-btn d-none d-sm-flex position-relative"
                        aria-label="Notificaciones"
                        aria-expanded={isNotificationsOpen}
                        onClick={handleToggleNotifications}
                    >
                        <FiBell size={17} />
                        {notificationCount > 0 && (
                            <span className="topbar-notification-badge">
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </span>
                        )}
                    </button>

                    {isNotificationsOpen && (
                        <div className="topbar-notification-panel">
                            <div className="topbar-notification-header">
                                <strong>Notificaciones</strong>
                                <span>{notificationCount} total</span>
                            </div>

                            {isLoadingNotifications && (
                                <div className="topbar-notification-state">Cargando notificaciones...</div>
                            )}

                            {!isLoadingNotifications && notificationsError && (
                                <div className="topbar-notification-state text-danger">{notificationsError}</div>
                            )}

                            {!isLoadingNotifications && !notificationsError && notifications.length === 0 && (
                                <div className="topbar-notification-state">No hay notificaciones recientes.</div>
                            )}

                            {!isLoadingNotifications && !notificationsError && notifications.length > 0 && (
                                <div className="topbar-notification-list">
                                    {notifications.map((notification) => (
                                        <button
                                            key={notification.id}
                                            type="button"
                                            className="topbar-notification-item"
                                            onClick={() => handleOpenOrder(notification.order_id)}
                                        >
                                            <div className="topbar-notification-item-title">{notification.title}</div>
                                            <div className="topbar-notification-item-message">{notification.message}</div>
                                            <div className="topbar-notification-item-meta">
                                                <span>{notification.order_short_id}</span>
                                                <span>{new Date(notification.created_at).toLocaleString()}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

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
