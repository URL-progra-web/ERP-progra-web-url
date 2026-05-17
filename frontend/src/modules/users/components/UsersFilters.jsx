import React from 'react';
import { FiSearch } from 'react-icons/fi';
import { AppSelect } from '~/core/components';

const UsersFilters = ({ searchInput, onSearchChange, roleFilter, onRoleChange, statusFilter, onStatusChange, roles }) => {
    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-12 col-lg-6">
                    <div className="input-group">
                        <label className="visually-hidden" htmlFor="usersSearchInput">
                            Buscar usuarios por nombre o email
                        </label>
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            id="usersSearchInput"
                            type="text"
                            name="users_search"
                            autoComplete="off"
                            aria-label="Buscar por nombre o email"
                            className="form-control bg-body border-start-0 ps-0 shadow-none text-body"
                            placeholder="Buscar por nombre o email..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="visually-hidden" htmlFor="usersRoleFilter">Filtrar usuarios por rol</label>
                    <AppSelect
                        id="usersRoleFilter"
                        name="users_role_filter"
                        ariaLabel="Filtrar usuarios por rol"
                        value={roleFilter}
                        onChange={onRoleChange}
                        options={[
                            { value: '', label: 'Todos los Roles' },
                            ...roles.map(role => ({ value: role.id, label: role.name })),
                        ]}
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <label className="visually-hidden" htmlFor="usersStatusFilter">Filtrar usuarios por estado</label>
                    <AppSelect
                        id="usersStatusFilter"
                        name="users_status_filter"
                        ariaLabel="Filtrar usuarios por estado"
                        value={statusFilter}
                        onChange={onStatusChange}
                        options={[
                            { value: '', label: 'Todos los Estados' },
                            { value: 'active', label: 'Activos' },
                            { value: 'blocked', label: 'Bloqueados' },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default UsersFilters;
