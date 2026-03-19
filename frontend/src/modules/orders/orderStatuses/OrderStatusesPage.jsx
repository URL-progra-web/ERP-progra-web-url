import React from 'react';
import { FiLayers } from 'react-icons/fi';
import { useOrderStatuses } from './hooks/useOrderStatuses';
import { OrderStatusesTable } from './components/OrderStatusesTable';
import { TransitionPanel } from './components/TransitionPanel';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';

const OrderStatusesPage = () => {
    const {
        statuses,
        search,
        setSearch,
        workflow,
        isLoadingStatuses,
        isLoadingWorkflow,
        error,
        setError,
        runTransition,
    } = useOrderStatuses();

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Estados de Pedido"
                subtitle={`${statuses.length} estado(s) definidos`}
                icon={FiLayers}
                helper={(<span className="badge bg-warning-subtle text-warning-emphasis">Solo lectura</span>)}
            />

            <div className="d-flex flex-column gap-4">
                <TransitionPanel
                    workflow={workflow}
                    statuses={statuses}
                    onSubmit={runTransition}
                    isLoadingWorkflow={isLoadingWorkflow}
                />

                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3">
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                <h6 className="mb-0 text-uppercase text-muted small">Catálogo</h6>
                                <span className="badge bg-dark-subtle text-dark-emphasis">{statuses.length}</span>
                            </div>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar por nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <OrderStatusesTable
                        statuses={statuses}
                        isLoading={isLoadingStatuses}
                    />
                </div>
            </div>

            {error && (
                <AppAlert
                    type="warning"
                    header="Atención"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}
        </div>
    );
};

export default OrderStatusesPage;
