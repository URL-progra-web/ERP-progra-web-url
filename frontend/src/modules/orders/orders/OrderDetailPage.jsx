import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiMail, FiMapPin, FiPhone, FiPlus, FiSave, FiTrash2, FiTruck, FiUser } from 'react-icons/fi';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import { AppSelect } from '~/core/components';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import { useOrders } from './hooks/useOrders';
import { useOrderItems } from './hooks/useOrderItems';
import { orderService } from './services/orderService';
import { orderStatusesService } from '../orderStatuses/services/orderStatusesService';
import { formatCurrency } from './helpers/formatCurrency';
import { normalizeList } from './helpers/normalizeList';
import { OrderItemsTable } from './components/OrderItemsTable';
import { OrderItemModal } from './components/OrderItemModal';
import './order-detail.css';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const ordersListPath = `${getDashboardPath(user?.role?.name)}/orders/list`;

    const {
        fetchOrderDetail,
        updateOrder,
        deleteOrder,
        error,
        setError,
    } = useOrders({ autoFetch: false });
    const {
        items,
        isLoadingItems,
        error: itemsError,
        setError: setItemsError,
        createItem,
        updateItem,
        deleteItem,
    } = useOrderItems({ orderId });

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [catalogs, setCatalogs] = useState({ payment_methods: [] });
    const [statusOptions, setStatusOptions] = useState([]);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [isSubmittingItem, setIsSubmittingItem] = useState(false);
    const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [formData, setFormData] = useState({
        payment_method_id: '',
        shipping_address: '',
        shipping_cost: '',
        notes: '',
    });

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [detail, catalogData, statusesData] = await Promise.all([
                fetchOrderDetail(orderId),
                orderService.catalogs().catch(() => ({ payment_methods: [] })),
                orderStatusesService.list({ search: undefined }).catch(() => ({ results: [] })),
            ]);

            if (detail) {
                setOrder(detail);
                setFormData({
                    payment_method_id: detail.payment_method || '',
                    shipping_address: detail.shipping_address || '',
                    shipping_cost: detail.shipping_cost ?? '',
                    notes: detail.notes || '',
                });
            } else {
                setError('No se pudo cargar el detalle del pedido.');
            }

            setCatalogs({ payment_methods: normalizeList(catalogData?.payment_methods) });
            setStatusOptions(normalizeList(statusesData));
            setIsLoading(false);
        };

        load();
        loadHistory();
    }, [fetchOrderDetail, orderId, setError]);

    const loadHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const historyData = await orderService.getHistory(orderId);
            setHistory(historyData || []);
        } catch {
            setHistory([]);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (!location.state?.successMessage) return;
        navigate(location.pathname, { replace: true, state: {} });
    }, [location, navigate]);

    const subtitle = useMemo(() => {
        if (!order) return 'Detalle del pedido';
        return `${order.customer_name || `Cliente #${order.customer}`} • ${order.status_name || 'Sin estado'}`;
    }, [order]);

    const orderSummary = useMemo(() => {
        if (!order) return [];
        return [
            {
                label: 'Estado',
                value: order.status_name || 'Sin estado',
            },
            {
                label: 'Total',
                value: formatCurrency(order.total_amount),
            },
            {
                label: 'Items',
                value: `${items.length} registro(s)`,
            },
            {
                label: 'Actualizado',
                value: order.updated_at ? new Date(order.updated_at).toLocaleString() : 'Sin fecha',
            },
        ];
    }, [items.length, order]);

    const canMutateOrder = useMemo(() => (
        ['SOLICITADO', 'BORRADOR'].includes(String(order?.status_name || '').toUpperCase())
    ), [order?.status_name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!order || !canMutateOrder) return;

        const payload = {
            shipping_address: formData.shipping_address || null,
            notes: formData.notes || null,
        };

        if (formData.payment_method_id) {
            payload.payment_method_id = Number(formData.payment_method_id);
        }

        if (formData.shipping_cost !== '' && formData.shipping_cost !== null) {
            payload.shipping_cost = Number(formData.shipping_cost);
        }

        setIsSaving(true);
        const updated = await updateOrder(order.id, payload);
        setIsSaving(false);

        if (updated) {
            setOrder(updated);
            setSuccessMessage('Pedido actualizado correctamente.');
        }
    };

    const confirmDelete = async () => {
        if (!order || !canMutateOrder) return;
        const ok = await deleteOrder(order.id);
        if (ok) {
            navigate(ordersListPath);
        }
        setShowDeleteAlert(false);
    };

    const handleOpenCreateItem = () => {
        if (!canMutateOrder) return;
        setItemToEdit(null);
        setIsItemModalOpen(true);
    };

    const handleOpenEditItem = (item) => {
        if (!canMutateOrder) return;
        setItemToEdit(item);
        setIsItemModalOpen(true);
    };

    const handleSubmitItem = async (payload, itemId) => {
        if (!canMutateOrder) return false;
        setIsSubmittingItem(true);
        const ok = itemId
            ? await updateItem(itemId, payload)
            : await createItem(payload);
        setIsSubmittingItem(false);
        if (ok) {
            const refreshed = await fetchOrderDetail(orderId);
            if (refreshed) setOrder(refreshed);
            setSuccessMessage(itemId ? 'Item actualizado correctamente.' : 'Item agregado correctamente.');
        }
        return ok;
    };

    const handleConfirmDeleteItem = async () => {
        if (!itemToDelete || !canMutateOrder) return;
        const ok = await deleteItem(itemToDelete.id);
        if (ok) {
            const refreshed = await fetchOrderDetail(orderId);
            if (refreshed) setOrder(refreshed);
            setSuccessMessage('Item eliminado correctamente.');
        }
        setItemToDelete(null);
    };

    if (isLoading) {
        return <div className="p-3">Cargando detalle del pedido…</div>;
    }

    if (!order) {
        return (
            <div className="p-3">
                <div className="alert alert-warning">No se encontró el pedido solicitado.</div>
                <button type="button" className="btn btn-outline-dark" onClick={() => navigate(ordersListPath)}>
                    Volver al listado
                </button>
            </div>
        );
    }

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title={`Pedido ${order.short_id}`}
                subtitle={subtitle}
                icon={FiSave}
                actionLabel="Volver"
                actionIcon={FiArrowLeft}
                onAction={() => navigate(ordersListPath)}
            />

            {successMessage && (
                <div className="alert alert-success" role="alert">
                    <div className="d-flex justify-content-between align-items-center">
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

            {!canMutateOrder && (
                <div className="alert alert-info" role="alert">
                    Este pedido está en estado <strong>{order.status_name}</strong>. Solo se permite visualización; edición, agregado y eliminación están bloqueados.
                </div>
            )}

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-body py-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 text-uppercase text-muted small">Detalle</h6>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setShowDeleteAlert(true)}
                        disabled={!canMutateOrder}
                        title={canMutateOrder ? 'Eliminar pedido' : 'Solo editable en estado SOLICITADO o BORRADOR'}
                    >
                        <FiTrash2 className="me-2" />
                        Eliminar
                    </button>
                </div>

                <form className="card-body" onSubmit={handleSave}>
                    <div className="order-detail-hero mb-4">
                        <div className="order-detail-hero__main">
                            <div className="small text-uppercase text-muted fw-semibold mb-2">Pedido {order.short_id}</div>
                            <h3 className="order-detail-hero__title mb-2">
                                {order.customer_name || `Cliente #${order.customer}`}
                            </h3>
                            <div className="order-detail-pills">
                                {orderSummary.map((entry) => (
                                    <span key={entry.label} className="order-detail-pill">
                                        <strong>{entry.label}:</strong> {entry.value}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="order-detail-hero__side">
                            <div className="small text-uppercase text-muted fw-semibold mb-2">Resumen rapido</div>
                            <div className="small text-muted">
                                Creado {order.created_at ? new Date(order.created_at).toLocaleString() : 'Sin fecha'}
                            </div>
                            <div className="small text-muted mt-1">
                                Metodo de pago: {order.payment_method_name || 'Por definir'}
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-12 col-xl-5">
                            <div className="order-detail-panel h-100">
                                <div className="order-detail-panel__header">
                                    <span className="order-detail-panel__icon"><FiUser size={16} /></span>
                                    <div>
                                        <div className="fw-semibold">Cliente y destinatario</div>
                                        <div className="small text-muted">Datos de contacto del pedido</div>
                                    </div>
                                </div>

                                <div className="order-detail-contact-list">
                                    <div className="order-detail-contact-item">
                                        <span className="order-detail-contact-item__icon"><FiUser size={15} /></span>
                                        <div>
                                            <div className="small text-muted">Cliente</div>
                                            <div className="fw-semibold">{order.customer_name || `#${order.customer}`}</div>
                                            <div className="small text-muted">{order.customer_type_label || order.customer_type || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="order-detail-contact-item">
                                        <span className="order-detail-contact-item__icon"><FiPhone size={15} /></span>
                                        <div>
                                            <div className="small text-muted">Telefono</div>
                                            <div className="fw-semibold">{order.customer_phone || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="order-detail-contact-item">
                                        <span className="order-detail-contact-item__icon"><FiMail size={15} /></span>
                                        <div>
                                            <div className="small text-muted">Correo</div>
                                            <div className="fw-semibold">{order.customer_email || '-'}</div>
                                        </div>
                                    </div>
                                    <div className="order-detail-contact-item">
                                        <span className="order-detail-contact-item__icon"><FiMapPin size={15} /></span>
                                        <div>
                                            <div className="small text-muted">Direccion del cliente</div>
                                            <div className="fw-semibold">{order.customer_address || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-xl-7">
                            <div className="order-detail-panel h-100">
                                <div className="order-detail-panel__header">
                                    <span className="order-detail-panel__icon"><FiTruck size={16} /></span>
                                    <div>
                                        <div className="fw-semibold">Envio y gestion interna</div>
                                        <div className="small text-muted">Actualiza la informacion operativa del pedido</div>
                                    </div>
                                </div>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label" htmlFor="orderDetailStatus">Estado</label>
                                        <input
                                            id="orderDetailStatus"
                                            name="order_detail_status"
                                            autoComplete="off"
                                            className="form-control"
                                            value={order.status_name || `#${order.status}`}
                                            readOnly
                                            disabled
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label" htmlFor="orderDetailPaymentMethod">Método de Pago</label>
                                        <AppSelect
                                            id="orderDetailPaymentMethod"
                                            name="payment_method_id"
                                            value={formData.payment_method_id}
                                            onChange={(paymentMethodId) => handleChange({ target: { name: 'payment_method_id', value: paymentMethodId } })}
                                            disabled={!canMutateOrder}
                                            options={[
                                                { value: '', label: '(Ninguno / Por definir)' },
                                                ...catalogs.payment_methods.map((pm) => ({ value: pm.id, label: pm.name })),
                                            ]}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label" htmlFor="orderDetailShippingCost">Costo de Envío</label>
                                        <input
                                            id="orderDetailShippingCost"
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            name="shipping_cost"
                                            autoComplete="off"
                                            value={formData.shipping_cost}
                                            onChange={handleChange}
                                            disabled={!canMutateOrder}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label" htmlFor="orderDetailShippingAddress">Dirección de Envío</label>
                                        <textarea
                                            id="orderDetailShippingAddress"
                                            className="form-control"
                                            rows="2"
                                            name="shipping_address"
                                            autoComplete="street-address"
                                            value={formData.shipping_address}
                                            onChange={handleChange}
                                            disabled={!canMutateOrder}
                                            placeholder="Direccion final donde se entrega el pedido"
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label" htmlFor="orderDetailNotes">Notas</label>
                                        <textarea
                                            id="orderDetailNotes"
                                            className="form-control"
                                            rows="3"
                                            name="notes"
                                            autoComplete="off"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            disabled={!canMutateOrder}
                                            placeholder="Indicaciones internas, observaciones o acuerdos con el cliente"
                                        />
                                    </div>

                                    <div className="col-12 d-flex justify-content-end">
                                        <button type="submit" className="btn btn-dark" disabled={isSaving || !canMutateOrder}>
                                            {isSaving ? 'Guardando…' : 'Guardar cambios'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="card border-0 shadow-sm mt-4">
                <div className="card-header bg-body py-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 className="mb-0 text-uppercase text-muted small">Items del Pedido</h6>
                        <small className="text-muted">
                            {items.length} item(s) • Total: {formatCurrency(order.total_amount)}
                        </small>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-dark"
                        onClick={handleOpenCreateItem}
                        disabled={!canMutateOrder}
                        title={canMutateOrder ? 'Agregar item' : 'Solo editable en estado SOLICITADO o BORRADOR'}
                    >
                        <FiPlus className="me-2" />Agregar Item
                    </button>
                </div>
                <OrderItemsTable
                    items={items}
                    isLoading={isLoadingItems}
                    onEdit={handleOpenEditItem}
                    onDelete={(item) => setItemToDelete(item)}
                    canEdit={canMutateOrder}
                />
            </div>

            <div className="card border-0 shadow-sm mt-4">
                <div className="card-header bg-body py-3 d-flex align-items-center">
                    <FiClock className="me-2" />
                    <h6 className="mb-0 text-uppercase text-muted small">Historial de Estados</h6>
                </div>
                <div className="card-body">
                    {isLoadingHistory ? (
                        <div className="text-muted">Cargando historial…</div>
                    ) : history.length === 0 ? (
                        <div className="text-muted">No hay historial de cambios.</div>
                    ) : (
                        <div className="order-history-timeline">
                            {history.map((entry, index) => (
                                <article key={entry.id} className="order-history-item">
                                    <div className="order-history-item__rail">
                                        <span className="order-history-item__dot" />
                                        {index < history.length - 1 && <span className="order-history-item__line" />}
                                    </div>
                                    <div className="order-history-item__content">
                                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
                                            <div>
                                                <div className="fw-semibold">{entry.status_name}</div>
                                                <div className="small text-muted">
                                                    {entry.user_name || 'Sistema'} · {new Date(entry.created_at).toLocaleDateString()} · {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="order-detail-pills">
                                                <span className="order-detail-pill">Antes: {entry.previous_status_name || '-'}</span>
                                                <span className="order-detail-pill order-detail-pill--primary">Ahora: {entry.status_name}</span>
                                            </div>
                                        </div>
                                        <div className="small text-muted">
                                            {entry.notes || 'Sin notas para este cambio.'}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
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

            {showDeleteAlert && (
                <AppAlert
                    type="danger"
                    header="¿Eliminar pedido?"
                    content={`Esta acción eliminará el pedido ${order.short_id}.`}
                    confirmLabel="Sí, eliminar"
                    onConfirm={confirmDelete}
                    onClose={() => setShowDeleteAlert(false)}
                />
            )}

            {itemsError && (
                <AppAlert
                    type="warning"
                    header="Atención"
                    content={itemsError}
                    onClose={() => setItemsError(null)}
                />
            )}

            <OrderItemModal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                onSubmit={handleSubmitItem}
                isSubmitting={isSubmittingItem}
                item={itemToEdit}
                statusOptions={statusOptions}
                orderId={order?.id}
                submitDisabled={!canMutateOrder}
            />

            {itemToDelete && (
                <AppAlert
                    type="danger"
                    header="¿Eliminar item del pedido?"
                    content={`Se eliminará el item ${itemToDelete.variant_sku || `#${itemToDelete.id}`}.`}
                    confirmLabel="Sí, eliminar item"
                    onConfirm={handleConfirmDeleteItem}
                    onClose={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default OrderDetailPage;
