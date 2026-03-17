import React, { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useUsers } from '../hooks/useUsers';
import UsersFilters from '../components/UsersFilters';
import UsersTable from '../components/UsersTable';
import UsersPagination from '../components/UsersPagination';
import UserModal from '../components/UserModal';

const UsersList = () => {
    const {
        users, count, numPages, roles, isLoading, error,
        searchInput, setSearchInput,
        roleFilter, setRoleFilter,
        statusFilter, setStatusFilter,
        page, setPage,
        toggleStatus, saveUser,
    } = useUsers();

    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = (user = null) => { setSelectedUser(user); setIsModalOpen(true); };
    const handleCloseModal = () => { setSelectedUser(null); setIsModalOpen(false); };

    const handleSave = async (userData) => {
        await saveUser(userData, selectedUser?.id);
        handleCloseModal();
    };

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">Gestión de Usuarios</h2>
                    <small className="text-muted">{count} usuario(s) encontrado(s)</small>
                </div>
                <button
                    className="btn btn-primary d-flex align-items-center fw-bold shadow-sm"
                    onClick={() => handleOpenModal()}
                >
                    <FiPlus className="me-2" /> Nuevo Usuario
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card border-0 shadow-sm overflow-hidden bg-body border">
                {/* Filters */}
                <UsersFilters
                    searchInput={searchInput}
                    onSearchChange={setSearchInput}
                    roleFilter={roleFilter}
                    onRoleChange={setRoleFilter}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    roles={roles}
                />

                {/* Table */}
                <div className="table-responsive">
                    <table className="table table-hover mb-0 align-middle">
                        <thead className="bg-body-tertiary text-muted small text-uppercase">
                            <tr>
                                <th className="border-0 px-4 py-3">Nombre</th>
                                <th className="border-0 py-3">Email</th>
                                <th className="border-0 py-3">Rol</th>
                                <th className="border-0 py-3">Estado</th>
                                <th className="border-0 px-4 py-3 text-end">Acciones</th>
                            </tr>
                        </thead>
                        <UsersTable
                            users={users}
                            isLoading={isLoading}
                            onEdit={handleOpenModal}
                            onToggleStatus={toggleStatus}
                        />
                    </table>
                </div>

                {/* Pagination */}
                <UsersPagination
                    page={page}
                    numPages={numPages}
                    count={count}
                    onPageChange={setPage}
                />
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <UserModal
                    user={selectedUser}
                    roles={roles}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default UsersList;
