import React from 'react';
import { FiLayers } from 'react-icons/fi';
import { useOrderStatuses } from './hooks/useOrderStatuses';
import { OrderStatusesTable } from './components/OrderStatusesTable';
import { TransitionPanel } from './components/TransitionPanel';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
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
                isDark
            />

            <div className="d-flex flex-column gap-4">
                <TransitionPanel
                    workflow={workflow}
                    statuses={statuses}
                    onSubmit={runTransition}
                    isLoadingWorkflow={isLoadingWorkflow}
                />

                <AppCard accent="var(--bs-orange)">
                    <AppCard.Section label="Filtros">
                        <div className="p-3 p-md-4 border-bottom">
                            <label className="visually-hidden" htmlFor="orderStatusesSearchInput">
                                Buscar estados por nombre
                            </label>
                            <input
                                id="orderStatusesSearchInput"
                                type="search"
                                name="order_statuses_search"
                                autoComplete="off"
                                className="form-control"
                                placeholder="Buscar por nombre..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </AppCard.Section>

                    <AppCard.Section label="Catálogo">
                        <OrderStatusesTable
                            statuses={statuses}
                            isLoading={isLoadingStatuses}
                        />
                    </AppCard.Section>
                </AppCard>
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
