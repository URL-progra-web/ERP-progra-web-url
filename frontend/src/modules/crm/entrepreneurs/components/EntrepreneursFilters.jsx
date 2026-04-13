import React from 'react';

export const EntrepreneursFilters = ({
    search,
    onSearchChange,
    createdFrom,
    onCreatedFromChange,
    createdTo,
    onCreatedToChange,
    onSubmit,
}) => {
    const handleSubmit = (evt) => {
        evt.preventDefault();
        onSubmit?.();
    };

    return (
        <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
                <label className="form-label small text-muted" htmlFor="entrepreneursSearchInput">Buscar</label>
                <input
                    id="entrepreneursSearchInput"
                    type="search"
                    name="entrepreneurs_search"
                    autoComplete="off"
                    className="form-control"
                    placeholder="Empresa, contacto, correo o teléfono"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="col-md-3">
                <label className="form-label small text-muted" htmlFor="entrepreneursCreatedFrom">Desde</label>
                <input
                    id="entrepreneursCreatedFrom"
                    type="date"
                    name="entrepreneurs_created_from"
                    autoComplete="off"
                    className="form-control"
                    value={createdFrom}
                    onChange={(e) => onCreatedFromChange(e.target.value)}
                />
            </div>
            <div className="col-md-3">
                <label className="form-label small text-muted" htmlFor="entrepreneursCreatedTo">Hasta</label>
                <input
                    id="entrepreneursCreatedTo"
                    type="date"
                    name="entrepreneurs_created_to"
                    autoComplete="off"
                    className="form-control"
                    value={createdTo}
                    onChange={(e) => onCreatedToChange(e.target.value)}
                />
            </div>
            <div className="col-md-2 d-flex align-items-end">
                <button className="btn btn-secondary w-100" type="submit">
                    Aplicar
                </button>
            </div>
        </form>
    );
};
