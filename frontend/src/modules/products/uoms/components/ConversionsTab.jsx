import React from 'react';
import { FiEdit2, FiTrash2, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { AppSelect } from '~/core/components';
import TableActions from '~/core/components/TableActions';

/**
 * Tab completa de Conversiones: filtros + tabla.
 */
export function ConversionsTab({
    conversions, isLoading,
    uoms,
    fromUomFilter, setFromUomFilter,
    toUomFilter, setToUomFilter,
    onEdit, onDelete,
}) {
    const hasFilter = fromUomFilter || toUomFilter;

    return (
        <div>
            {/* Filters */}
            <div className="px-4 py-3 border-bottom d-flex gap-3 flex-wrap align-items-end">
                <div style={{ minWidth: 200 }}>
                    <label className="form-label small fw-semibold mb-1" htmlFor="conversionsFromUomFilter">UOM Origen</label>
                    <AppSelect
                        id="conversionsFromUomFilter"
                        name="conversions_from_uom_filter"
                        ariaLabel="Filtrar conversiones por UOM origen"
                        value={fromUomFilter}
                        onChange={setFromUomFilter}
                        options={[
                            { value: '', label: 'Todas' },
                            ...uoms.map(u => ({ value: u.id, label: `${u.name} (${u.code})` })),
                        ]}
                    />
                </div>
                <div style={{ minWidth: 200 }}>
                    <label className="form-label small fw-semibold mb-1" htmlFor="conversionsToUomFilter">UOM Destino</label>
                    <AppSelect
                        id="conversionsToUomFilter"
                        name="conversions_to_uom_filter"
                        ariaLabel="Filtrar conversiones por UOM destino"
                        value={toUomFilter}
                        onChange={setToUomFilter}
                        options={[
                            { value: '', label: 'Todas' },
                            ...uoms.map(u => ({ value: u.id, label: `${u.name} (${u.code})` })),
                        ]}
                    />
                </div>
                {hasFilter && (
                    <button
                        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                        onClick={() => { setFromUomFilter(''); setToUomFilter(''); }}
                    >
                        <FiRefreshCw size={13} /> Limpiar filtros
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table className="table table-hover mb-0 align-middle" style={{ minWidth: '600px' }}>
                    <thead className="bg-body-tertiary text-muted small text-uppercase">
                        <tr>
                            <th className="border-0 px-4 py-3">Desde</th>
                            <th className="border-0 py-3 text-center" style={{ width: 40 }}></th>
                            <th className="border-0 py-3">Hasta</th>
                            <th className="border-0 py-3">Multiplicador</th>
                            <th className="border-0 px-4 py-3 text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-5 text-muted">
                                    <div className="spinner-border spinner-border-sm me-2" /> Cargando...
                                </td>
                            </tr>
                        ) : conversions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-5 text-muted">
                                    No hay conversiones{hasFilter ? ' para los filtros seleccionados' : ''}. Crea la primera.
                                </td>
                            </tr>
                        ) : (
                            conversions.map(conv => (
                                <tr key={conv.id}>
                                    <td className="px-4">
                                        <span className="fw-semibold">{conv.from_uom_name}</span>
                                        <span className="text-muted ms-1 small">({conv.from_uom_code})</span>
                                    </td>
                                    <td className="text-center text-muted">
                                        <FiArrowRight />
                                    </td>
                                    <td>
                                        <span className="fw-semibold">{conv.to_uom_name}</span>
                                        <span className="text-muted ms-1 small">({conv.to_uom_code})</span>
                                    </td>
                                    <td>
                                        <code className="bg-body-secondary px-2 py-1 rounded small">
                                            × {conv.multiplier}
                                        </code>
                                    </td>
                                    <td className="px-4 text-end">
                                        <TableActions actions={[
                                            { icon: FiEdit2,  onClick: () => onEdit(conv),   title: 'Editar',   variant: 'primary' },
                                            { icon: FiTrash2, onClick: () => onDelete(conv), title: 'Eliminar', variant: 'danger'  },
                                        ]} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
