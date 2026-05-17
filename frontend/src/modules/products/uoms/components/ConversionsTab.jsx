import React from 'react';
import { FiEdit2, FiTrash2, FiRefreshCw, FiArrowRight } from 'react-icons/fi';
import { AppSelect } from '~/core/components';
import TableActions from '~/core/components/TableActions';

const DeleteActionButton = ({ onClick, title = 'Eliminar' }) => (
    <button
        type="button"
        title={title}
        onClick={onClick}
        className="table-action-btn table-action-btn--danger"
    >
        <FiTrash2 size={15} />
    </button>
);

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
        <div className="uoms-conversions-panel">
            <div className="uoms-conversions-filters">
                <div className="uoms-conversions-filters__top">
                    <div>
                        <h4 className="uoms-conversions-filters__title">Filtrar equivalencias</h4>
                        <p className="uoms-conversions-filters__text">
                            Usa origen y destino para encontrar rápidamente relaciones específicas entre unidades.
                        </p>
                    </div>
                    {hasFilter && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 page-header__action-button"
                            onClick={() => { setFromUomFilter(''); setToUomFilter(''); }}
                        >
                            <FiRefreshCw size={14} /> Limpiar filtros
                        </button>
                    )}
                </div>

                <div className="uoms-conversions-filters__grid">
                    <div className="uoms-conversions-filter-field">
                        <label className="form-label small fw-semibold mb-0" htmlFor="conversionsFromUomFilter">UOM Origen</label>
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
                    <div className="uoms-conversions-filter-field">
                        <label className="form-label small fw-semibold mb-0" htmlFor="conversionsToUomFilter">UOM Destino</label>
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
                </div>
            </div>

            <div className="table-responsive bg-body">
                <table className="table table-hover mb-0 align-middle" style={{ minWidth: '600px' }}>
                    <thead className="text-uppercase text-muted small">
                        <tr>
                            <th className="border-0 px-4 py-3">Desde</th>
                            <th className="border-0 py-3 text-center" style={{ width: 64 }}></th>
                            <th className="border-0 py-3">Hasta</th>
                            <th className="border-0 py-3">Multiplicador</th>
                            <th className="border-0 py-3 text-end">Acciones</th>
                            <th className="border-0 px-4 py-3 text-end">Eliminar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-5">
                                    <div className="spinner-border text-primary spinner-border-sm me-2" />
                                    <span className="text-muted">Cargando…</span>
                                </td>
                            </tr>
                        ) : conversions.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-5 text-muted">
                                    {hasFilter
                                        ? 'No existen conversiones para la combinación de filtros actual.'
                                        : 'No hay conversiones registradas. Crea la primera para comenzar.'}
                                </td>
                            </tr>
                        ) : (
                            conversions.map(conv => (
                                <tr key={conv.id} className="border-bottom border-light-subtle">
                                    <td className="px-4 py-3">
                                        <div className="uoms-flow-cell">
                                            <span className="uoms-flow-cell__name">{conv.from_uom_name}</span>
                                            <span className="uoms-flow-cell__code">({conv.from_uom_code})</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-center">
                                        <span className="uoms-flow-arrow">
                                            <FiArrowRight size={15} />
                                        </span>
                                    </td>
                                    <td className="py-3">
                                        <div className="uoms-flow-cell">
                                            <span className="uoms-flow-cell__name">{conv.to_uom_name}</span>
                                            <span className="uoms-flow-cell__code">({conv.to_uom_code})</span>
                                        </div>
                                    </td>
                                    <td className="py-3">
                                        <span className="uoms-multiplier-chip">
                                            × {conv.multiplier}
                                        </span>
                                    </td>
                                    <td className="py-3 text-end">
                                        <TableActions actions={[
                                            { icon: FiEdit2, onClick: () => onEdit(conv), title: 'Editar', variant: 'primary' },
                                        ]} />
                                    </td>
                                    <td className="px-4 py-3 text-end">
                                        <DeleteActionButton onClick={() => onDelete(conv)} />
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
