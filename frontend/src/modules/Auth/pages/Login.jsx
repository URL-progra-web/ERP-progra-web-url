import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/core/auth/AuthContext';
import { useTheme } from '~/core/theme/ThemeContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import { FiMail, FiLock, FiTerminal, FiSun, FiMoon } from 'react-icons/fi';
import { FaApple, FaGoogle, FaXTwitter } from 'react-icons/fa6';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userData = await login(email, password);
            const dashPath = getDashboardPath(userData?.role?.name);
            navigate(dashPath);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        }
    };

    return (
        <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-body p-4 overflow-hidden position-relative">
            {/* Theme Toggle in Login */}
            <div className="position-absolute top-0 end-0 p-4">
                <button 
                    className="btn btn-outline-secondary border-0 rounded-circle p-2 shadow-none" 
                    onClick={toggleTheme}
                >
                    {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} className="text-warning" />}
                </button>
            </div>

            {/* Background Decorative Elements */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25" style={{ pointerEvents: 'none', zIndex: 0 }}>
                <div className="position-absolute rounded-circle border border-primary opacity-10" style={{ width: '600px', height: '600px', top: '-200px', left: '-200px' }}></div>
                <div className="position-absolute rounded-circle border border-primary opacity-10" style={{ width: '600px', height: '600px', bottom: '-200px', right: '-200px' }}></div>
            </div>

            <div className="card border-0 rounded-4 shadow-lg p-4 p-md-5 bg-body-tertiary" style={{ 
                maxWidth: '440px', 
                width: '100%', 
                zIndex: 1
            }}>
                <div className="text-center mb-4">
                    <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-4" style={{ width: '64px', height: '64px' }}>
                        <FiTerminal size={32} className="text-primary" />
                    </div>
                    <h2 className="fw-bold mb-1">Bienvenido nuevamente</h2>
                    <p className="text-secondary small mb-0">¿Aún no tienes una cuenta? <a href="#" className="text-primary fw-bold text-decoration-none">Regístrate</a></p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <div className="input-group input-group-lg bg-body rounded-3 border">
                            <span className="input-group-text bg-transparent border-0 text-secondary">
                                <FiMail size={18} />
                            </span>
                            <input
                                type="email"
                                className="form-control bg-transparent border-0 text-body"
                                placeholder="Correo electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="input-group input-group-lg bg-body rounded-3 border">
                            <span className="input-group-text bg-transparent border-0 text-secondary">
                                <FiLock size={18} />
                            </span>
                            <input
                                type="password"
                                className="form-control bg-transparent border-0 text-body"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ boxShadow: 'none' }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger bg-danger bg-opacity-10 border-danger text-danger small py-2 mb-4" role="alert">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold rounded-3 mb-4 py-2 shadow-sm">
                        Iniciar sesión
                    </button>
                </form>

                <div className="d-flex align-items-center mb-4">
                    <div className="flex-grow-1 border-bottom opacity-25"></div>
                    <span className="px-3 text-secondary small text-uppercase">o</span>
                    <div className="flex-grow-1 border-bottom opacity-25"></div>
                </div>

                <div className="row g-2">
                    <div className="col-4">
                        <button className="btn btn-outline-secondary w-100 py-2 bg-body text-body d-flex align-items-center justify-content-center border opacity-75">
                            <FaApple size={20} />
                        </button>
                    </div>
                    <div className="col-4">
                        <button className="btn btn-outline-secondary w-100 py-2 bg-body text-body d-flex align-items-center justify-content-center border opacity-75">
                            <FaGoogle size={20} />
                        </button>
                    </div>
                    <div className="col-4">
                        <button className="btn btn-outline-secondary w-100 py-2 bg-body text-body d-flex align-items-center justify-content-center border opacity-75">
                            <FaXTwitter size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
