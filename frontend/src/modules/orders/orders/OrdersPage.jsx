import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useOrders } from './hooks/useOrders';
import { OrdersTable } from './components/OrdersTable';
import { orderStatusesService } from '../orderStatuses/services/orderStatusesService';
import AppAlert from '~/core/components/AppAlert';
import PageHeader from '~/core/components/PageHeader';
import AppPagination from '~/core/components/AppPagination';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';

const OrdersPage = () => {
    const {
        orders,
        count,
        numPages,
        page,
        setPage,
        search,
        setSearch,
        isLoadingOrders,
        fetchOrders,
        deleteOrder,
        error,
        setError,
    } = useOrders();
    const navigate = useNavigate();
    const { user } = useAuth();
    const basePath = getDashboardPath(user?.role?.name);
    const [workflow, setWorkflow] = React.useState({});
    const [successMessage, setSuccessMessage] = React.useState('');
    const [deleteCandidate, setDeleteCandidate] = React.useState(null);
    const [transitionCandidate, setTransitionCandidate] = React.useState(null);
    const [deletingOrderId, setDeletingOrderId] = React.useState(null);
    const [transitioningOrderId, setTransitioningOrderId] = React.useState(null);

    React.useEffect(() => {
        const loadWorkflow = async () => {
            try {
                const response = await orderStatusesService.workflow();
                setWorkflow(response?.workflow || {});
            } catch (err) {
                setError(err?.response?.data?.error || 'No se pudo cargar el flujo de estados.');
            }
        };

        loadWorkflow();
    }, [setError]);

    const getTransitions = React.useCallback((order) => {
        const currentStatus = String(order?.status_name || '').toUpperCase();
        return workflow[currentStatus] || [];
    }, [workflow]);

    const handleConfirmDelete = async () => {
        if (!deleteCandidate) return;

        setDeletingOrderId(deleteCandidate.id);
        const ok = await deleteOrder(deleteCandidate.id);
        setDeletingOrderId(null);

        if (ok) {
            setSuccessMessage(`Pedido ${deleteCandidate.short_id} eliminado correctamente.`);
        }

        setDeleteCandidate(null);
    };

    const handleConfirmTransition = async () => {
        if (!transitionCandidate) return;

        setTransitioningOrderId(transitionCandidate.order.id);
        try {
            await orderStatusesService.transition({
                order_id: transitionCandidate.order.id,
                target_status: transitionCandidate.targetStatus,
            });
            await fetchOrders();
            setSuccessMessage(
                `Pedido ${transitionCandidate.order.short_id} actualizado a ${transitionCandidate.targetStatus}.`
            );
            setError(null);
        } catch (err) {
            setError(err?.response?.data?.error || 'No se pudo cambiar el estado del pedido.');
        } finally {
            setTransitioningOrderId(null);
            setTransitionCandidate(null);
        }
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Pedidos"
                subtitle={`${count} pedido(s) registrado(s)`}
                icon={FiShoppingCart}
                actionLabel="Nuevo Pedido"
                actionIcon={FiShoppingCart}
                onAction={() => navigate(`${basePath}/orders/create`)}
            />

            {successMessage && (
                <div className="alert alert-success" role="alert">
                    <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <span>{successMessage}</span>
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => setSuccessMessage('')}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}

            <div className="d-flex flex-column gap-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3">
                        <div className="d-flex flex-column gap-2">
                            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                                <h6 className="mb-0 text-uppercase text-muted small">Listado</h6>
                                <span className="badge bg-dark-subtle text-dark-emphasis">{count}</span>
                            </div>
                            <input
                                type="search"
                                className="form-control"
                                placeholder="Buscar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <OrdersTable
                        orders={orders}
                        isLoading={isLoadingOrders}
                        getTransitions={getTransitions}
                        deletingOrderId={deletingOrderId}
                        transitioningOrderId={transitioningOrderId}
                        onDelete={setDeleteCandidate}
                        onTransition={(order, targetStatus) => setTransitionCandidate({ order, targetStatus })}
                        onViewDetail={(orderId) => {
                            navigate(`${basePath}/orders/detail/${orderId}`);
                        }}
                    />

                    <AppPagination
                        page={page}
                        numPages={numPages}
                        count={count}
                        onPageChange={setPage}
                    />
                </div>
            </div>

            {error && (
                <AppAlert
                    type="danger"
                    header="Error"
                    content={error}
                    onClose={() => setError(null)}
                />
            )}

            {deleteCandidate && (
                <AppAlert
                    type="danger"
                    header="¿Eliminar pedido?"
                    content={`Esta acción eliminará el pedido ${deleteCandidate.short_id}.`}
                    confirmLabel="Sí, eliminar"
                    onConfirm={handleConfirmDelete}
                    onClose={() => setDeleteCandidate(null)}
                />
            )}

            {transitionCandidate && (
                <AppAlert
                    type="warning"
                    header="¿Cambiar estado del pedido?"
                    content={`El pedido ${transitionCandidate.order.short_id} pasará a ${transitionCandidate.targetStatus}.`}
                    confirmLabel="Sí, cambiar estado"
                    onConfirm={handleConfirmTransition}
                    onClose={() => setTransitionCandidate(null)}
                />
            )}
        </div>
    );
};

export default OrdersPage;
