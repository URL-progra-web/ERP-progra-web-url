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
                <label className="form-label small text-muted" htmlFor="customersSearchInput">Buscar</label>
                <input
                    id="customersSearchInput"
                    type="search"
                    name="customers_search"
                    autoComplete="off"
                    className="form-control"
                    placeholder="Nombre, correo o teléfono"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
            <div className="col-md-3">
                <label className="form-label small text-muted" htmlFor="customersCreatedFrom">Desde</label>
                <input
                    id="customersCreatedFrom"
                    type="date"
                    name="customers_created_from"
                    autoComplete="off"
                    className="form-control"
                    value={createdFrom}
                    onChange={(e) => onCreatedFromChange(e.target.value)}
                />
            </div>
            <div className="col-md-3">
                <label className="form-label small text-muted" htmlFor="customersCreatedTo">Hasta</label>
                <input
                    id="customersCreatedTo"
                    type="date"
                    name="customers_created_to"
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
