import React from 'react';
import { FiSearch } from 'react-icons/fi';

const UsersFilters = ({ searchInput, onSearchChange, roleFilter, onRoleChange, statusFilter, onStatusChange, roles }) => {
    return (
        <div className="card-body bg-body-tertiary border-bottom p-3">
            <div className="row g-3">
                <div className="col-md-5">
                    <div className="input-group">
                        <span className="input-group-text bg-body border-end-0 text-muted">
                            <FiSearch size={14} />
                        </span>
                        <input
                            type="text"
                            className="form-control bg-body border-start-0 ps-0 shadow-none text-body"
                            placeholder="Buscar por nombre o email..."
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>
                </div>
                <div className="col-md-3 col-6">
                    <select className="form-select bg-body shadow-none text-body" value={roleFilter} onChange={(e) => onRoleChange(e.target.value)}>
                        <option value="">Todos los Roles</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3 col-6">
                    <select className="form-select bg-body shadow-none text-body" value={statusFilter} onChange={(e) => onStatusChange(e.target.value)}>
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
