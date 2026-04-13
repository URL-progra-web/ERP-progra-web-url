import React, { useMemo } from 'react';
import { FiShuffle } from 'react-icons/fi';
import AppCard from '~/core/components/AppCard';

export const TransitionPanel = ({ workflow, isLoadingWorkflow }) => {

    const workflowEntries = useMemo(() => Object.entries(workflow?.workflow || {}), [workflow]);

    return (
        <AppCard accent="var(--bs-orange)">
            <AppCard.Section label={<span className="d-flex align-items-center gap-2"><FiShuffle /> Motor de transiciones</span>}>
            <div className="p-3 p-md-4">
                <div className="mb-4">
                    <h6 className="text-uppercase text-muted small">Flujo disponible</h6>
                    {isLoadingWorkflow ? (
                        <div className="text-muted small">Cargando flujo...</div>
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

                <p className="text-muted small mb-0">
                    Las transiciones de estado se aplican desde la vista de pedidos.
                </p>
            </div>
            </AppCard.Section>
        </AppCard>
    );
};
