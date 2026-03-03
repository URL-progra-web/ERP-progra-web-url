import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userFrontendService } from '~users/services/userFrontendService';

export const useUsersDashboard = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

            if (response.results) {
                setUsers(response.results);
                setTotalPages(Math.ceil(response.count / 10));
            } else {
                setUsers(Array.isArray(response) ? response : []);
                setTotalPages(1);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            if (error.response?.status === 403) {
                navigate('/app/pos');
            }
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter, navigate]);

    useEffect(() => {
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
                await userFrontendService.deleteUser(user.id);
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

    return {
        users,
        loading,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        page,
        setPage,
        totalPages,
        isModalOpen,
        userToEdit,
        handleCreateClick,
        handleEditClick,
        handleToggleActive,
        handleModalClose
    };
};
