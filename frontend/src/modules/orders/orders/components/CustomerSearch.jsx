import React, { useEffect } from 'react';
import { FiMail, FiPhone, FiSearch, FiUser } from 'react-icons/fi';
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
        mode,
        setMode,
        modeOptions,
        placeholder,
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
    const helperIcon = mode === 'email'
        ? FiMail
        : mode === 'phone'
            ? FiPhone
            : mode === 'name'
                ? FiUser
                : FiSearch;
    const HelperIcon = helperIcon;

    const handleSelect = (customer) => {
        onSelect(customer);
        clearResults();
    };

    const handleClear = () => {
        onClear();
        clearResults();
    };

    return (
        <div className="d-flex flex-column gap-3">
            <div>
                <div className="small text-muted mb-2">Buscar cliente por</div>
                <div className="order-customer-search__modes" role="tablist" aria-label="Modo de busqueda de cliente">
                    {modeOptions.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`order-customer-search__mode ${mode === option.value ? 'is-active' : ''}`}
                            onClick={() => {
                                setMode(option.value);
                                clearResults();
                            }}
                            disabled={disabled}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="d-flex gap-2 flex-column flex-sm-row">
                <input
                    id={inputId}
                    type="text"
                    name="customer_search"
                    autoComplete="off"
                    aria-label={`Buscar cliente por ${mode}`}
                    className="form-control"
                    placeholder={placeholder}
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
                    className="btn btn-dark"
                    onClick={handleSearch}
                    disabled={disabled || isSearching}
                >
                    {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
            </div>
            <div className="small text-muted d-flex align-items-center gap-2">
                <HelperIcon size={14} />
                <span>
                    {mode === 'general' && 'Busca por cualquier dato y priorizamos coincidencias claras.'}
                    {mode === 'name' && 'Ideal cuando recuerdas el nombre del cliente.'}
                    {mode === 'email' && 'Util para clientes con correo registrado.'}
                    {mode === 'phone' && 'Acepta telefono con o sin espacios.'}
                </span>
            </div>
            {error && <div className="text-danger small mt-2">{error}</div>}
            {selectedCustomer && (
                <div className="order-customer-search__selected">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                            <div className="small text-uppercase text-muted fw-semibold mb-1">Cliente seleccionado</div>
                            <div className="fw-semibold">{selectedCustomer.name || `Cliente #${selectedCustomer.id}`}</div>
                            <div className="small text-muted">{selectedCustomer.email || 'Sin correo'} · {selectedCustomer.phone || 'Sin telefono'}</div>
                            {selectedCustomer.address && (
                                <div className="small text-muted mt-1">{selectedCustomer.address}</div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="btn btn-link btn-sm p-0 text-decoration-none"
                            onClick={handleClear}
                        >
                            Quitar
                        </button>
                    </div>
                </div>
            )}
            {!!results.length && !selectedCustomer && (
                <div className="list-group order-customer-search__results">
                    {results.map((customer) => (
                        <button
                            type="button"
                            key={customer.id}
                            className="list-group-item list-group-item-action order-customer-search__result"
                            onClick={() => handleSelect(customer)}
                        >
                            <div className="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                    <div className="fw-semibold">{customer.name || `Cliente #${customer.id}`}</div>
                                    <div className="small text-muted">
                                        {customer.email || 'Sin correo'}
                                    </div>
                                    <div className="small text-muted">
                                        {customer.phone || 'Sin telefono'}
                                    </div>
                                </div>
                                <span className="badge text-bg-light border">Seleccionar</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            {!results.length && !selectedCustomer && query.trim() && !isSearching && !error && (
                <div className="small text-muted">
                    No hay coincidencias para esta búsqueda. Intenta otro criterio o un término más corto.
                </div>
            )}
        </div>
    );
};
