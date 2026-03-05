import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~users/context/AuthContext';
import { LoginForm } from '~users/components/LoginForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/app/pos');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Mostrar loading mientras verifica la sesión
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 transition-colors duration-200 relative">
            <div className="w-full max-w-sm space-y-6">
                {/* Logo / Brand */}
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        ERP Micro
                    </h1>
                    <p className="text-sm text-muted-foreground">Sistema de gestión empresarial</p>
                </div>

                {/* Card */}
                <Card className="shadow-sm border-border transition-shadow duration-200 hover:shadow">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-base font-semibold">Iniciar sesión</CardTitle>
                        <CardDescription className="text-xs">
                            Ingresa tus credenciales para acceder
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} ERP Micro. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;
