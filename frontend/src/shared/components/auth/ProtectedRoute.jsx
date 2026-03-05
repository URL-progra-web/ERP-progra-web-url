import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '~users/context/AuthContext';
import Spinner from '~shared/components/Spinner';

/**
 * Guard para proteger rutas que requieren autenticación
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar si está autenticado
 * @param {boolean} props.requireAdmin - Si true, requiere que el usuario sea superuser
 * @param {string} props.redirectTo - Ruta de redirección si no está autenticado (default: /login)
 */
export default function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = '/login'
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => setShowSpinner(true), 400); // 400ms delay to avoid flicker
    }
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    if (!showSpinner) return null; // Evitar flicker si carga rápido

    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permisos de admin si es requerido
  if (requireAdmin && !user?.is_superuser) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <svg
              className="h-12 w-12 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
          <p className="text-sm text-muted-foreground">
            Contacta a un administrador si crees que deberías tener acceso.
          </p>
        </div>
      </div>
    );
  }

  // Usuario autenticado y autorizado
  return children;
}
