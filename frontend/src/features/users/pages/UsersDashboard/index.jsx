import React from 'react';
import UsersHeader from '~users/components/UsersHeader';
import UsersFilters from '~users/components/UsersFilters';
import UserTable from '~users/components/UserTable';
import UsersPagination from '~users/components/UsersPagination';
import UserFormModal from '~users/components/UserFormModal';
import { useUsersDashboard } from './useUsersDashboard';

const UsersDashboard = () => {
    const {
        users, loading, search, setSearch,
        statusFilter, setStatusFilter, page, setPage, totalPages,
        isModalOpen, userToEdit,
        handleCreateClick, handleEditClick, handleToggleActive, handleModalClose
    } = useUsersDashboard();

    return (
        <div className="space-y-6">
            <UsersHeader onCreate={handleCreateClick} />

            <div className="bg-card border border-border rounded-lg shadow-sm">
                <UsersFilters
                    search={search}
                    onSearchChange={(val) => { setSearch(val); setPage(1); }}
                    statusFilter={statusFilter}
                    onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
                />

                <UserTable
                    users={users}
                    loading={loading}
                    onEdit={handleEditClick}
                    onToggleActive={handleToggleActive}
                />

                <UsersPagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
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
