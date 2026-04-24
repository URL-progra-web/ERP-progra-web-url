import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDownload, FiShoppingCart } from 'react-icons/fi';
import { useOrders } from './hooks/useOrders';
import { OrdersTable } from './components/OrdersTable';
import { orderService } from './services/orderService';
import { orderStatusesService } from '../orderStatuses/services/orderStatusesService';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
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
    const [notifications, setNotifications] = React.useState([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = React.useState(false);
    // --- exportar excel ---
    const [showExportModal, setShowExportModal] = React.useState(false);
    const [exportDateFrom, setExportDateFrom] = React.useState('');
    const [exportDateTo, setExportDateTo] = React.useState('');
    const [isExporting, setIsExporting] = React.useState(false);

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

    React.useEffect(() => {
        const loadNotifications = async () => {
            setIsLoadingNotifications(true);
            try {
                const response = await orderService.listNotifications({ page: 1, page_size: 5 });
                setNotifications(Array.isArray(response?.results) ? response.results : []);
            } catch {
                setNotifications([]);
            } finally {
                setIsLoadingNotifications(false);
            }
        };

        loadNotifications();
    }, []);

    const getTransitions = React.useCallback((order) => {
        const currentStatus = String(order?.status_name || '').toUpperCase();
        return workflow[currentStatus] || [];
    }, [workflow]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await orderService.exportExcel({
                date_from: exportDateFrom || undefined,
                date_to:   exportDateTo   || undefined,
            });
        } catch {
            setError('No se pudo exportar el Excel. Intente nuevamente.');
        } finally {
            setIsExporting(false);
            setShowExportModal(false);
        }
    };

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
                isDark
            />

            {/* Botón exportar Excel */}
            <div className="d-flex justify-content-end mb-3">
                <button
                    id="btnExportarExcel"
                    type="button"
                    className="btn btn-outline-success d-flex align-items-center gap-2"
                    onClick={() => setShowExportModal(true)}
                >
                    <FiDownload />
                    Exportar a Excel
                </button>
            </div>

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

            {!isLoadingNotifications && notifications.length > 0 && (
                <div className="alert alert-info" role="status">
                    <div className="fw-semibold mb-2">Nuevos pedidos de tienda online</div>
                    <ul className="mb-0 ps-3">
                        {notifications.map((notification) => (
                            <li key={notification.id}>
                                {notification.message} ({new Date(notification.created_at).toLocaleString()})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <AppCard accent="var(--bs-orange)">
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
                        <label className="visually-hidden" htmlFor="ordersSearchInput">
                            Buscar pedidos por ID, cliente o estado
                        </label>
                        <input
                            id="ordersSearchInput"
                            type="search"
                            name="orders_search"
                            autoComplete="off"
                            className="form-control"
                            placeholder="Buscar por ID, cliente, estado..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </AppCard.Section>

                <AppCard.Section label="Listado de pedidos">
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
                </AppCard.Section>
            </AppCard>

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
            {/* Modal exportar Excel */}
            {showExportModal && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1050,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="exportModalTitle"
                >
                    <div className="card shadow" style={{ width: '100%', maxWidth: 420 }}>
                        <div className="card-header d-flex align-items-center gap-2">
                            <FiDownload />
                            <span id="exportModalTitle" className="fw-semibold mb-0">
                                Exportar pedidos a Excel
                            </span>
                        </div>
                        <div className="card-body">
                            <p className="text-muted small mb-3">
                                Selecciona un rango de fechas de creación. Si no seleccionas ninguna, se exportarán <strong>todos</strong> los pedidos.
                            </p>
                            <div className="mb-3">
                                <label htmlFor="exportDateFrom" className="form-label">Fecha desde</label>
                                <input
                                    id="exportDateFrom"
                                    type="date"
                                    className="form-control"
                                    value={exportDateFrom}
                                    onChange={(e) => setExportDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="exportDateTo" className="form-label">Fecha hasta</label>
                                <input
                                    id="exportDateTo"
                                    type="date"
                                    className="form-control"
                                    value={exportDateTo}
                                    onChange={(e) => setExportDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="card-footer d-flex justify-content-end gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowExportModal(false)}
                                disabled={isExporting}
                            >
                                Cancelar
                            </button>
                            <button
                                id="btnConfirmarExportarExcel"
                                type="button"
                                className="btn btn-success d-flex align-items-center gap-2"
                                onClick={handleExport}
                                disabled={isExporting}
                            >
                                {isExporting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                        Generando…
                                    </>
                                ) : (
                                    <>
                                        <FiDownload />
                                        Descargar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

    );
};

export default OrdersPage;
