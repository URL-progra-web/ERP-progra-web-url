import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '~/core/auth/AuthContext';
import { getNavigationConfig } from '~/core/registry/registryUtils';

/* ── Sub-components ──────────────────────────────────────────── */

const WelcomeCard = ({ user }) => {
    const initial = user?.name?.charAt(0)?.toUpperCase() || 'U';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, rgba(var(--bs-primary-rgb),0.18) 0%, rgba(var(--bs-primary-rgb),0.04) 100%)',
                border: '1px solid rgba(var(--bs-primary-rgb),0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                flexWrap: 'wrap',
            }}
        >
            <div
                style={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: 'var(--bs-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: '22px',
                    color: 'white',
                    flexShrink: 0,
                }}
            >
                {initial}
            </div>
            <div>
                <p style={{ margin: '0 0 2px', fontSize: '13px', color: 'var(--bs-secondary-color)' }}>
                    {greeting}
                </p>
                <h2 style={{
                    margin: '0 0 4px',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: 'var(--bs-body-color)',
                }}>
                    {user?.name}
                </h2>
                <span style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'rgba(var(--bs-primary-rgb),0.15)',
                    color: 'var(--bs-primary)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '11px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                }}>
                    {user?.role?.name || 'Usuario'}
                </span>
            </div>
        </div>
    );
};

const QuickNavItem = ({ item }) => {
    const Icon = item.icon;
    return (
        <Link
            to={item.path}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '20px',
                background: 'var(--bs-secondary-bg)',
                border: '1px solid var(--bs-border-color)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all var(--transition)',
            }}
            onMouseOver={e => {
                e.currentTarget.style.borderColor = 'rgba(var(--bs-primary-rgb),0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--bs-border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            <div style={{
                width: 38, height: 38,
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(var(--bs-primary-rgb),0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                <Icon size={18} style={{ color: 'var(--bs-primary)' }} />
            </div>
            <div>
                <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--bs-body-color)',
                    lineHeight: 1.2,
                }}>
                    {item.text}
                </p>
            </div>
        </Link>
    );
};

/* ── Page ────────────────────────────────────────────────────── */

const OverviewHome = () => {
    const { user } = useAuth();
    const navigationConfig = getNavigationConfig();
    const userRole = user?.role?.name || 'VISITOR';

    const allItems = navigationConfig
        .flatMap(g => g.items)
        .filter(item => !item.roles || item.roles.includes(userRole))
        .slice(0, 8);

    return (
        <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <WelcomeCard user={user} />

            {allItems.length > 0 && (
                <div>
                    <h5 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '13px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--bs-tertiary-color)',
                        margin: '0 0 14px',
                    }}>
                        Acceso rápido
                    </h5>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                        gap: '12px',
                    }}>
                        {allItems.map((item, i) => (
                            <QuickNavItem key={i} item={item} />
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                padding: '16px 20px',
                background: 'var(--bs-secondary-bg)',
                border: '1px solid var(--bs-border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--bs-tertiary-color)',
                }}>
                    Usa el menú lateral para navegar por todos los módulos del sistema.
                </span>
            </div>
        </div>
    );
};

export default OverviewHome;
