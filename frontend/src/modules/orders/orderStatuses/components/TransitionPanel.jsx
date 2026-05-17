import React, { useMemo, useState, useEffect } from 'react';
import { FiSend, FiShuffle, FiUser, FiPhone, FiMapPin, FiDollarSign } from 'react-icons/fi';
import AppCard from '~/core/components/AppCard';
import { orderService } from '../../orders/services/orderService';

export const TransitionPanel = ({ workflow, statuses, onSubmit, isLoadingWorkflow }) => {
    const [form, setForm] = useState({ order_id: '', target_status: '', notes: '' });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [orderPreview, setOrderPreview] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const statusOptions = useMemo(() => statuses.map((s) => ({ value: s.name, label: s.name })), [statuses]);

    const workflowEntries = useMemo(() => Object.entries(workflow?.workflow || {}), [workflow]);

    useEffect(() => {
        const fetchOrderPreview = async () => {
            if (!form.order_id || Number(form.order_id) < 1) {
                setOrderPreview(null);
                return;
            }
            setIsLoadingPreview(true);
            try {
                const data = await orderService.get(form.order_id);
                setOrderPreview(data);
            } catch {
                setOrderPreview(null);
            } finally {
                setIsLoadingPreview(false);
            }
        };

        const timeoutId = setTimeout(fetchOrderPreview, 300);
        return () => clearTimeout(timeoutId);
    }, [form.order_id]);

    const handleChange = (evt) => {
        const { name, value } = evt.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (evt) => {
        evt.preventDefault();
        if (!form.order_id || !form.target_status) {
            setError('Completa el pedido y el nuevo estado.');
            return;
        }
        try {
            const response = await onSubmit({
                order_id: Number(form.order_id),
                target_status: form.target_status,
                notes: form.notes || undefined,
            });
            setResult(response);
            setError(null);
        } catch (err) {
            setResult(null);
            setError(err?.response?.data?.error || 'No se pudo aplicar la transición.');
        }
    };

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

                <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-md-4">
                            <label className="form-label small text-muted">ID del pedido *</label>
                            <input
                                type="number"
                                min="1"
                                className="form-control"
                                name="order_id"
                                value={form.order_id}
                                onChange={handleChange}
                            />
                        </div>
                        {form.order_id && (
                            <div className="col-12">
                                {isLoadingPreview ? (
                                    <div className="text-muted small py-2">Buscando pedido...</div>
                                ) : orderPreview ? (
                                    <div className="card bg-body border mt-2">
                                        <div className="card-body py-2 px-3">
                                            <div className="row g-2 small">
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FiUser className="text-muted" />
                                                        <span className="fw-medium">{orderPreview.customer_name || `Cliente #${orderPreview.customer}`}</span>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`badge ${orderPreview.status_name?.toUpperCase() === 'SOLICITADO' ? 'bg-primary' : 'bg-secondary'}`}>
                                                            {orderPreview.status_name || `#${orderPreview.status}`}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <FiDollarSign className="text-muted" />
                                                        <span className="fw-medium">{orderPreview.total_amount != null ? `$${Number(orderPreview.total_amount).toFixed(2)}` : '-'}</span>
                                                    </div>
                                                </div>
                                                {orderPreview.shipping_address && (
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-start gap-2">
                                                            <FiMapPin className="text-muted mt-1" />
                                                            <span className="text-muted">{orderPreview.shipping_address}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {orderPreview.phone && (
                                                    <div className="col-12">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FiPhone className="text-muted" />
                                                            <span className="text-muted">{orderPreview.phone}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-danger small py-2 mt-2">No se encontró el pedido #{form.order_id}</div>
                                )}
                            </div>
                        )}
                        <div className="col-md-4">
                            <label className="form-label small text-muted">Nuevo estado *</label>
                            <select
                                className="form-select text-uppercase"
                                name="target_status"
                                value={form.target_status}
                                onChange={handleChange}
                            >
                                <option value="">Selecciona...</option>
                                {statusOptions.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small text-muted">Notas</label>
                            <input
                                type="text"
                                className="form-control"
                                name="notes"
                                placeholder="Opcional"
                                value={form.notes}
                                onChange={handleChange}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    {error && <div className="alert alert-danger mb-0 py-2">{error}</div>}
                    {result && (
                        <div className="alert alert-success mb-0 py-2">
                            Pedido #{result.order_id} → Estado {result.status}
                        </div>
                    )}

                    <div className="text-end">
                        <button type="submit" className="btn btn-dark">
                            <FiSend className="me-2" /> Aplicar transición
                        </button>
                    </div>
                </form>
            </div>
            </AppCard.Section>
        </AppCard>
    );
};
