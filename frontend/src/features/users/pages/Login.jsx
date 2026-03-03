import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Building2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const email = e.target.email.value;
        const password = e.target.password.value;

        try {
            await authService.login(email, password);
            navigate('/app/pos');
        } catch (err) {
            setError('Credenciales inválidas. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

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
                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Correo electrónico</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@erp.com"
                                    defaultValue="admin@erp.com"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <a
                                        href="#"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </a>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    defaultValue="password"
                                />
                            </div>
                            <Button type="submit" className="w-full mt-2" disabled={loading}>
                                {loading ? 'Iniciando...' : 'Iniciar sesión'}
                            </Button>
                        </form>
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
