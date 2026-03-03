import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Power, PowerOff } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const UserTable = ({ users, loading, onEdit, onToggleActive }) => {
    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando usuarios...</div>;
    }

    if (!users || users.length === 0) {
        return <div className="p-8 text-center text-muted-foreground">No se encontraron usuarios.</div>;
    }

    return (
        <div className="w-full relative overflow-auto">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium text-foreground">
                                        {user.first_name || user.last_name
                                            ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                                            : 'Sin nombre'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm">{user.phone || 'N/A'}</span>
                            </TableCell>
                            <TableCell>
                                {user.is_superuser ? (
                                    <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">Admin</Badge>
                                ) : user.is_staff ? (
                                    <Badge variant="secondary">Staff</Badge>
                                ) : (
                                    <Badge variant="outline">Normal</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                                {user.is_active ? (
                                    <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Activo</Badge>
                                ) : (
                                    <Badge variant="secondary" className="bg-slate-300 text-slate-700 hover:bg-slate-400">Inactivo</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Abrir menú</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => onEdit(user)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Editar
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onToggleActive(user)}
                                            className={user.is_active ? 'text-red-600 focus:text-red-600' : 'text-emerald-600 focus:text-emerald-600'}
                                        >
                                            {user.is_active ? (
                                                <><PowerOff className="mr-2 h-4 w-4" /> Desactivar</>
                                            ) : (
                                                <><Power className="mr-2 h-4 w-4" /> Activar</>
                                            )}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default UserTable;
