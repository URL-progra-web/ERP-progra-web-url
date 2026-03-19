import React from 'react';

export const CustomersFilters = ({
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
                <label className="form-label small text-muted">Buscar</label>
                <input
                    type="search"
                    className="form-control"
                    placeholder="Nombre, correo o teléfono"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="col-md-3">
                <label className="form-label small text-muted">Desde</label>
                <input
                    type="date"
                    className="form-control"
                    value={createdFrom}
                    onChange={(e) => onCreatedFromChange(e.target.value)}
                />
            </div>
            <div className="col-md-3">
                <label className="form-label small text-muted">Hasta</label>
                <input
                    type="date"
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
