import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';

const UsersHeader = ({ onCreate }) => {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    Gestión de Usuarios
                </h1>
                <p className="text-muted-foreground text-sm">
                    Administra los usuarios del sistema, sus roles y estados.
                </p>
            </div>
            <Button onClick={onCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Usuario
            </Button>
        </div>
    );
};

export default UsersHeader;
