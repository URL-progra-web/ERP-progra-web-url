import React, { useEffect } from 'react';
import { useCustomerSearch } from '../hooks/useCustomerSearch';

export const CustomerSearch = ({
    selectedCustomer,
    onSelect,
    onClear,
    disabled,
    initialQuery = '',
    inputId = 'customerSearchInput',
}) => {
    const {
        query,
        setQuery,
        results,
        isSearching,
        error,
        search,
        clearResults,
    } = useCustomerSearch({ initialQuery });

    useEffect(() => {
        if (selectedCustomer) {
            clearResults();
        }
    }, [selectedCustomer, clearResults]);

    const handleSearch = () => search();

    const handleSelect = (customer) => {
        onSelect(customer);
        clearResults();
    };

    const handleClear = () => {
        onClear();
        clearResults();
    };

    return (
        <div>
            <div className="d-flex gap-2">
                <input
                    id={inputId}
                    type="text"
                    name="customer_search"
                    autoComplete="off"
                    aria-label="Buscar cliente por nombre, correo o teléfono"
                    className="form-control"
                    placeholder="Buscar cliente por nombre, correo o teléfono..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                    disabled={disabled}
                />
                <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleSearch}
                    disabled={disabled || isSearching}
                >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
            </div>
            {error && <div className="text-danger small mt-2">{error}</div>}
            {selectedCustomer && (
                <div className="mt-2 small text-muted d-flex align-items-center gap-2">
                    <span className="fw-semibold">Seleccionado:</span>
                    <span>{selectedCustomer.name || `Cliente #${selectedCustomer.id}`}</span>
                    <button
                        type="button"
                        className="btn btn-link btn-sm p-0 text-decoration-none"
                        onClick={handleClear}
                    >
                        Quitar
                    </button>
                </div>
            )}
            {!!results.length && !selectedCustomer && (
                <div className="list-group mt-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {results.map((customer) => (
                        <button
                            type="button"
                            key={customer.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleSelect(customer)}
                        >
                            <div className="fw-semibold">{customer.name || `Cliente #${customer.id}`}</div>
                            <div className="small text-muted">
                                {(customer.email || 'Sin email')}
                                {' - '}
                                {(customer.phone || 'Sin teléfono')}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
