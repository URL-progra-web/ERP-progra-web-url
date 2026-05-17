import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/core/auth/AuthContext';
import { useTheme } from '~/core/theme/ThemeContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import {
    FiMail, FiLock, FiSun, FiMoon, FiArrowRight,
    FiTerminal, FiShoppingBag, FiUsers, FiPackage, FiCheck,
} from 'react-icons/fi';

/* ─────────────────────────────────────────────────────────────
   BRAND PANEL — always dark, full-height decorative side
   ───────────────────────────────────────────────────────────── */

const STATS = [
    { icon: FiShoppingBag, value: '142', label: 'Pedidos' },
    { icon: FiUsers,       value: '58',  label: 'Clientes' },
    { icon: FiPackage,     value: '234', label: 'Productos' },
];

const FEATURES = [
    'Gestión de pedidos en tiempo real',
    'CRM con historial de clientes',
    'Inventario y variantes de productos',
];

const StatChip = ({ icon: Icon, value, label, delay }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        padding: '14px 18px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        flex: 1,
        animation: `countUp 0.5s cubic-bezier(0.4,0,0.2,1) ${delay} both`,
    }}>
        <Icon size={16} style={{ color: '#818cf8', marginBottom: 2 }} />
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: '#f0f6fc', lineHeight: 1 }}>
            {value}
        </span>
        <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(221,230,244,0.4)' }}>
            {label}
        </span>
    </div>
);

const BrandPanel = () => (
    <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 52px',
        background: '#070c17',
        position: 'relative', overflow: 'hidden',
        animation: 'slideInLeft 0.6s cubic-bezier(0.4,0,0.2,1) both',
    }}>
        {/* Scrolling grid */}
        <div aria-hidden style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
                linear-gradient(rgba(101,115,248,0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(101,115,248,0.055) 1px, transparent 1px)
            `,
            backgroundSize: '44px 44px',
            animation: 'gridScroll 8s linear infinite',
        }} />

        {/* Orb 1 — indigo, top-left */}
        <div aria-hidden style={{
            position: 'absolute', top: '-100px', left: '-100px',
            width: 420, height: 420,
            background: 'radial-gradient(circle, rgba(101,115,248,0.22) 0%, transparent 68%)',
            borderRadius: '50%',
            animation: 'orbFloat 14s ease-in-out infinite',
        }} />

        {/* Orb 2 — cyan, bottom-right */}
        <div aria-hidden style={{
            position: 'absolute', bottom: '-80px', right: '-80px',
            width: 340, height: 340,
            background: 'radial-gradient(circle, rgba(34,211,238,0.16) 0%, transparent 68%)',
            borderRadius: '50%',
            animation: 'orbFloat2 18s ease-in-out infinite',
        }} />

        {/* Orb 3 — violet, center */}
        <div aria-hidden style={{
            position: 'absolute', top: '45%', left: '55%',
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'orbFloat 22s ease-in-out infinite reverse',
        }} />

        {/* Brand mark */}
        <div style={{ position: 'relative', zIndex: 1, animation: 'fadeSlideUp 0.5s 0.1s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: 36, height: 36, background: '#6573f8', borderRadius: '9px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(101,115,248,0.4)',
                }}>
                    <FiTerminal size={18} color="white" />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '16px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f0f6fc' }}>
                    ERP System
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginLeft: '4px' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', animation: 'blink 1.8s ease-in-out infinite', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
                    <span style={{ fontSize: '10px', color: 'rgba(221,230,244,0.45)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>LIVE</span>
                </div>
            </div>
        </div>

        {/* Center content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Stats */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                {STATS.map((s, i) => (
                    <StatChip key={s.label} {...s} delay={`${0.3 + i * 0.12}s`} />
                ))}
            </div>

            {/* Headline */}
            <h1 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(2rem, 2.8vw, 3rem)', lineHeight: 1.08,
                letterSpacing: '-0.04em', color: '#f0f6fc', margin: '0 0 18px',
                animation: 'fadeSlideUp 0.6s 0.2s both',
            }}>
                Gestión de<br />
                <span style={{
                    background: 'linear-gradient(90deg, #818cf8, #38bdf8, #818cf8)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shimmerText 3.5s linear infinite',
                }}>
                    operaciones
                </span><br />
                centralizada.
            </h1>

            <p style={{
                color: 'rgba(221,230,244,0.5)', fontSize: '15px', lineHeight: 1.65,
                margin: '0 0 28px', maxWidth: '360px',
                animation: 'fadeSlideUp 0.6s 0.3s both',
            }}>
                Control de pedidos, inventario, clientes y reportes: todo en un solo lugar.
            </p>

            {/* Feature list */}
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {FEATURES.map((feat, i) => (
                    <li key={feat} style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '13px', color: 'rgba(221,230,244,0.65)',
                        animation: `fadeSlideUp 0.5s ${0.4 + i * 0.1}s both`,
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(101,115,248,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <FiCheck size={11} style={{ color: '#818cf8' }} />
                        </div>
                        {feat}
                    </li>
                ))}
            </ul>
        </div>

        {/* Footer */}
        <p style={{
            position: 'relative', zIndex: 1, margin: 0,
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'rgba(221,230,244,0.22)', letterSpacing: '0.06em',
            animation: 'fadeIn 1s 0.8s both',
        }}>
            v2.0 · &copy; 2026 ERP System
        </p>
    </div>
);

/* ─────────────────────────────────────────────────────────────
   FORM FIELD
   ───────────────────────────────────────────────────────────── */

const FormField = ({ icon: Icon, type, placeholder, value, onChange, required, animDelay }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: 'var(--bs-body-bg)',
            border: `1px solid ${focused ? 'var(--bs-primary)' : 'var(--bs-border-color)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0 14px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused ? '0 0 0 3px rgba(var(--bs-primary-rgb), 0.15)' : 'none',
            animation: `slideInRight 0.45s cubic-bezier(0.4,0,0.2,1) ${animDelay} both`,
        }}>
            <Icon size={17} style={{ color: focused ? 'var(--bs-primary)' : 'var(--bs-secondary-color)', transition: 'color 0.2s', flexShrink: 0 }} />
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    flex: 1, border: 'none', background: 'transparent',
                    color: 'var(--bs-body-color)', fontFamily: 'var(--font-body)',
                    fontSize: '15px', padding: '13px 0', outline: '0',
                }}
            />
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   THEME TOGGLE
   ───────────────────────────────────────────────────────────── */

const ThemeToggle = ({ theme, onToggle }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onToggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'absolute', top: 24, right: 24,
                width: 38, height: 38,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--bs-border-color)',
                background: hovered ? 'var(--bs-tertiary-bg)' : 'transparent',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: hovered ? 'var(--bs-body-color)' : 'var(--bs-secondary-color)',
                transition: 'background-color 0.2s, color 0.2s',
                animation: 'fadeIn 0.5s 0.5s both',
            }}
        >
            {theme === 'light' ? <FiMoon size={17} /> : <FiSun size={17} />}
        </button>
    );
};

/* ─────────────────────────────────────────────────────────────
   LOGIN PAGE
   ───────────────────────────────────────────────────────────── */

const Login = () => {
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [shakeKey, setShakeKey] = useState(0);

    const { login }              = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate               = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userData = await login(email, password);
            navigate(getDashboardPath(userData?.role?.name));
        } catch (err) {
            setError(err.response?.data?.error || 'Credenciales inválidas');
            setShakeKey(k => k + 1);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bs-body-bg)' }}>

            {/* Left decorative panel — desktop only */}
            <div className="d-none d-lg-flex" style={{ flex: '0 0 50%', maxWidth: '50%' }}>
                <BrandPanel />
            </div>

            {/* Right form panel */}
            <div style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: 'clamp(24px, 6vw, 72px)',
                position: 'relative',
                animation: 'slideInRight 0.55s cubic-bezier(0.4,0,0.2,1) 0.05s both',
            }}>
                <ThemeToggle theme={theme} onToggle={toggleTheme} />

                <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>

                    {/* Mobile brand */}
                    <div className="d-flex d-lg-none align-items-center gap-2 mb-5"
                        style={{ animation: 'fadeSlideUp 0.4s 0.1s both' }}>
                        <div style={{
                            width: 32, height: 32, background: 'var(--bs-primary)', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 16px rgba(var(--bs-primary-rgb), 0.4)',
                        }}>
                            <FiTerminal size={16} color="white" />
                        </div>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--bs-body-color)' }}>
                            ERP System
                        </span>
                    </div>

                    {/* Headline */}
                    <div style={{ animation: 'slideInRight 0.45s cubic-bezier(0.4,0,0.2,1) 0.15s both' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.85rem', letterSpacing: '-0.03em', margin: '0 0 6px', color: 'var(--bs-body-color)' }}>
                            Bienvenido de vuelta
                        </h2>
                        <p style={{ margin: '0 0 32px', fontSize: '14px', color: 'var(--bs-secondary-color)' }}>
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    {/* Form */}
                    <form key={shakeKey} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <FormField
                            icon={FiMail} type="email" placeholder="Correo electrónico"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required animDelay="0.3s"
                        />
                        <FormField
                            icon={FiLock} type="password" placeholder="Contraseña"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required animDelay="0.42s"
                        />

                        {error && (
                            <div key={shakeKey} style={{
                                padding: '10px 14px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                color: '#f87171', fontSize: '13px', lineHeight: 1.5,
                                animation: 'shake 0.45s cubic-bezier(0.4,0,0.2,1) both',
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                            style={{
                                marginTop: '4px', padding: '13px', fontSize: '15px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                borderRadius: 'var(--radius-md)',
                                animation: 'slideInRight 0.45s cubic-bezier(0.4,0,0.2,1) 0.55s both',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16, height: 16,
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spinnerRotate 0.7s linear infinite',
                                        flexShrink: 0,
                                    }} />
                                    Verificando…
                                </>
                            ) : (
                                <>Continuar <FiArrowRight size={17} /></>
                            )}
                        </button>
                    </form>

                    <p style={{ marginTop: '36px', fontSize: '12px', color: 'var(--bs-tertiary-color)', textAlign: 'center', animation: 'fadeIn 0.5s 0.9s both' }}>
                        &copy; 2026 ERP System · Uso interno
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
