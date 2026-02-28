import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    ShoppingCart,
    Package,
    Users,
    Building2,
    LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/app/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { to: '/app/inventory', label: 'Inventario', icon: Package },
    { to: '/app/hr', label: 'Recursos Humanos', icon: Users },
];

const DashboardLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-background font-sans transition-colors duration-200">
            {/* Sidebar */}
            <aside className="w-60 flex flex-col bg-sidebar-bg text-sidebar-fg shrink-0 transition-colors duration-200">
                {/* Brand */}
                <div className="flex items-center gap-2.5 px-5 py-5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/5">
                        <Building2 className="h-4 w-4 text-sidebar-fg" />
                    </div>
                    <span className="font-semibold text-sm tracking-wide">ERP Micro</span>
                </div>

                <Separator className="bg-black/10" />

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                                    isActive
                                        ? 'bg-black/10 text-sidebar-fg font-medium'
                                        : 'text-sidebar-fg/70 hover:bg-black/5 hover:text-sidebar-fg'
                                )
                            }
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <Separator className="bg-black/10" />

                {/* User + Logout */}
                <div className="px-4 py-4 space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-black/10 text-sidebar-fg text-xs">
                                A
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-sidebar-fg truncate">Admin</p>
                            <p className="text-xs text-sidebar-fg/70 truncate">admin@erp.com</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-sidebar-fg/70 hover:text-sidebar-fg hover:bg-black/5 px-3"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </Button>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="flex items-center justify-between h-14 px-6 bg-card border-b border-border shrink-0 transition-colors duration-200">
                    <div /> {/* Left placeholder for breadcrumbs in future */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Bienvenido,</span>
                        <span className="text-sm font-medium text-foreground">Admin</span>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                A
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
