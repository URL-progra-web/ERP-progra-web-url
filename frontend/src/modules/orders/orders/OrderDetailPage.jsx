import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiTrash2 } from 'react-icons/fi';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import { useOrders } from './hooks/useOrders';
import { orderService } from './services/orderService';
import { normalizeList } from './helpers/normalizeList';

const OrderDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const {
        fetchOrderDetail,
        updateOrder,
        deleteOrder,
        error,
        setError,
    } = useOrders({ autoFetch: false });

    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [catalogs, setCatalogs] = useState({ payment_methods: [] });
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [formData, setFormData] = useState({
        payment_method_id: '',
        shipping_address: '',
        shipping_cost: '',
        notes: '',
    });

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            const [detail, catalogData] = await Promise.all([
                fetchOrderDetail(orderId),
                orderService.catalogs().catch(() => ({ payment_methods: [] })),
            ]);

            if (detail) {
                setOrder(detail);
                setFormData({
                    payment_method_id: detail.payment_method || '',
                    shipping_address: detail.shipping_address || '',
                    shipping_cost: detail.shipping_cost ?? '',
                    notes: detail.notes || '',
                });
            }

            setCatalogs({
                payment_methods: normalizeList(catalogData?.payment_methods),
            });
            setIsLoading(false);
        };

        load();
    }, [fetchOrderDetail, orderId]);

    const subtitle = useMemo(() => {
        if (!order) return 'Detalle del pedido';
        return `${order.customer_name || `Cliente #${order.customer}`} • ${order.status_name || 'Sin estado'}`;
    }, [order]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!order) return;

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
        }
    };

    const confirmDelete = async () => {
        if (!order) return;
        const ok = await deleteOrder(order.id);
        if (ok) {
            navigate('../list');
        }
        setShowDeleteAlert(false);
    };

    if (isLoading) {
        return <div className="p-3">Cargando detalle del pedido...</div>;
    }

    if (!order) {
        return (
            <div className="p-3">
                <div className="alert alert-warning">No se encontró el pedido solicitado.</div>
                <button type="button" className="btn btn-outline-dark" onClick={() => navigate('../list')}>
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
                onAction={() => navigate('../list')}
            />

            <div className="card border-0 shadow-sm">
                <div className="card-header bg-body py-3 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 text-uppercase text-muted small">Detalle</h6>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setShowDeleteAlert(true)}
                    >
                        <FiTrash2 className="me-2" />
                        Eliminar
                    </button>
                </div>

                <form className="card-body" onSubmit={handleSave}>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">Cliente</label>
                            <input className="form-control" value={order.customer_name || `#${order.customer}`} disabled />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Estado</label>
                            <input className="form-control" value={order.status_name || `#${order.status}`} disabled />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Método de Pago</label>
                            <select
                                className="form-select"
                                name="payment_method_id"
                                value={formData.payment_method_id}
                                onChange={handleChange}
                            >
                                <option value="">(Ninguno / Por definir)</option>
                                {catalogs.payment_methods.map((pm) => (
                                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Costo de Envío</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                name="shipping_cost"
                                value={formData.shipping_cost}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Dirección de Envío</label>
                            <textarea
                                className="form-control"
                                rows="2"
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Notas</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="col-12 d-flex justify-content-end">
                            <button type="submit" className="btn btn-dark" disabled={isSaving}>
                                {isSaving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </div>
                    </div>
                </form>
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
        </div>
    );
};

export default OrderDetailPage;
