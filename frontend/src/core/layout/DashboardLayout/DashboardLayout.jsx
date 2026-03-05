import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '~users/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Building2, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { menuConfig } from './menuConfig';

const SidebarMenuItem = ({ item, level = 0 }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const Icon = item.icon;

    if (hasChildren) {
        return (
            <div className="flex flex-col">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        'flex items-center justify-between w-full rounded-md px-3 py-2 text-sm transition-colors duration-200',
                        'text-sidebar-fg/70 hover:bg-black/5 hover:text-sidebar-fg'
                    )}
                    style={{ paddingLeft: `${(level + 1) * 0.75}rem` }}
                >
                    <div className="flex items-center gap-3">
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        {item.label}
                    </div>
                    {isOpen ? (
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    ) : (
                        <ChevronRight className="h-4 w-4 opacity-50" />
                    )}
                </button>
                {isOpen && (
                    <div className="mt-0.5 space-y-0.5">
                        {item.children.map((child, index) => (
                            <SidebarMenuItem key={child.to || index} item={child} level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={item.to}
            className={({ isActive }) =>
                cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200',
                    isActive
                        ? 'bg-black/10 text-sidebar-fg font-medium'
                        : 'text-sidebar-fg/70 hover:bg-black/5 hover:text-sidebar-fg'
                )
            }
            style={{ paddingLeft: `${(level + 1) * 0.75}rem` }}
        >
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {item.label}
        </NavLink>
    );
};

const DashboardLayout = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Obtener iniciales del usuario para el avatar
    const getInitials = () => {
        if (!user) return 'U';
        if (user.first_name && user.last_name) {
            return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
        }
        return user.email?.[0]?.toUpperCase() || 'U';
    };

    const displayName = user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}`
        : user?.email || 'Usuario';

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
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {menuConfig.map((item, index) => (
                        <SidebarMenuItem key={item.to || index} item={item} />
                    ))}
                </nav>

                <Separator className="bg-black/10" />

                {/* User + Logout */}
                <div className="px-4 py-4 space-y-3">
                    <div className="flex items-center gap-3 px-1">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-black/10 text-sidebar-fg text-xs">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-sidebar-fg truncate">{displayName}</p>
                            <p className="text-xs text-sidebar-fg/70 truncate">{user?.email}</p>
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
                        <span className="text-sm font-medium text-foreground">{user?.first_name || user?.email}</span>
                        <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                {getInitials()}
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
