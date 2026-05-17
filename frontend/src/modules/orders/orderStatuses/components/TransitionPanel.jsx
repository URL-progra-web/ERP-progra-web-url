import React, { useMemo } from 'react';
import { FiInfo, FiShuffle } from 'react-icons/fi';
import AppCard from '~/core/components/AppCard';

export const TransitionPanel = ({ workflow, isLoadingWorkflow }) => {
    const workflowEntries = useMemo(() => Object.entries(workflow?.workflow || {}), [workflow]);

    return (
        <AppCard accent="var(--bs-orange)">
            <AppCard.Section label={<span className="d-flex align-items-center gap-2"><FiShuffle /> Flujo de estados</span>}>
                <div className="p-3 p-md-4">
                    <div className="d-flex align-items-start gap-3 mb-4">
                        <span className="text-warning fs-5"><FiInfo /></span>
                        <div>
                            <div className="fw-semibold">Referencia visual del flujo</div>
                            <div className="small text-muted">
                                La gestión operativa de cambios de estado se realiza desde la otra interfaz.
                            </div>
                        </div>
                    </div>

                    <div>
                        <h6 className="text-uppercase text-muted small">Transiciones disponibles</h6>
                        {isLoadingWorkflow ? (
                            <div className="text-muted small">Cargando flujo…</div>
                        ) : (
                            <div className="d-flex flex-column gap-2">
                                {workflowEntries.map(([from, toList]) => (
                                    <div key={from} className="d-flex align-items-center flex-wrap gap-2">
                                        <span className="badge bg-secondary text-uppercase">{from}</span>
                                        <span className="text-muted small">→</span>
                                        {toList.length ? (
                                            toList.map((target) => (
                                                <span key={target} className="badge bg-success-subtle text-success-emphasis text-uppercase">
                                                    {target}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="badge bg-secondary-subtle text-secondary-emphasis text-uppercase">
                                                TERMINAL
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </AppCard.Section>
        </AppCard>
    );
};
