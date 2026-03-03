import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userFrontendService } from '../services/userFrontendService';
import UserTable from '../components/UserTable';
import UserFormModal from '../components/UserFormModal';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UsersDashboard = () => {
    // Basic auth check placeholder: redirect if not admin/staff
    // In a real app, you'd check a user context or token decoded role.
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

    // Pagination state (if backend supports paginated response as shown in router)
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let isActiveParam = undefined;
            if (statusFilter === 'active') isActiveParam = true;
            if (statusFilter === 'inactive') isActiveParam = false;

            const response = await userFrontendService.getUsers({
                page,
                search,
                is_active: isActiveParam
            });

            // Handle paginated response: { count, next, previous, results }
            // Or flat array if no pagination applied
            if (response.results) {
                setUsers(response.results);
                // Rough estimate of total pages assuming page size 10 (DRF default often)
                setTotalPages(Math.ceil(response.count / 10));
            } else {
                setUsers(Array.isArray(response) ? response : []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            if (error.response?.status === 403) {
                navigate('/app/pos'); // Redirect non-staff to a safe route
            }
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        // Simple debounce for search
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    const handleCreateClick = () => {
        setUserToEdit(null);
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleToggleActive = async (user) => {
        try {
            if (user.is_active) {
                await userFrontendService.deleteUser(user.id); // Soft delete deactivates
            } else {
                await userFrontendService.updateUser(user.id, { is_active: true });
            }
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle active status:', error);
        }
    };

    const handleModalClose = (wasSaved) => {
        setIsModalOpen(false);
        if (wasSaved) {
            fetchUsers();
        }
    };

    return (
        <div className="space-y-6">
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
                <Button onClick={handleCreateClick} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

            <div className="bg-card border border-border rounded-lg shadow-sm">
                <div className="p-4 flex flex-col sm:flex-row gap-4 border-b border-border items-center justify-between">
                    <div className="w-full sm:max-w-xs">
                        <Input
                            placeholder="Buscar por email o nombre..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select
                            value={statusFilter}
                            onValueChange={(val) => {
                                setStatusFilter(val);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="active">Activos</SelectItem>
                                <SelectItem value="inactive">Inactivos</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <UserTable
                    users={users}
                    loading={loading}
                    onEdit={handleEditClick}
                    onToggleActive={handleToggleActive}
                />

                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Página {page} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Siguiente
                        </Button>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <UserFormModal
                    isOpen={isModalOpen}
                    onClose={handleModalClose}
                    user={userToEdit}
                />
            )}
        </div>
    );
};

export default UsersDashboard;
