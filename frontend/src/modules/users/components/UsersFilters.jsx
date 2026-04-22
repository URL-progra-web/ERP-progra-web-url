import React from 'react';
import { FiSearch } from 'react-icons/fi';

const UsersFilters = ({ searchInput, onSearchChange, roleFilter, onRoleChange, statusFilter, onStatusChange, roles }) => {
    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-md-5">
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
                <div className="col-md-3 col-6">
                    <label className="visually-hidden" htmlFor="usersRoleFilter">Filtrar usuarios por rol</label>
                    <select
                        id="usersRoleFilter"
                        name="users_role_filter"
                        autoComplete="off"
                        aria-label="Filtrar usuarios por rol"
                        className="form-select bg-body shadow-none text-body"
                        value={roleFilter}
                        onChange={(e) => onRoleChange(e.target.value)}
                    >
                        <option value="">Todos los Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3 col-6">
                    <label className="visually-hidden" htmlFor="usersStatusFilter">Filtrar usuarios por estado</label>
                    <select
                        id="usersStatusFilter"
                        name="users_status_filter"
                        autoComplete="off"
                        aria-label="Filtrar usuarios por estado"
                        className="form-select bg-body shadow-none text-body"
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                    >
                        <option value="">Todos los Estados</option>
                        <option value="active">Activos</option>
                        <option value="blocked">Bloqueados</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default UsersFilters;
