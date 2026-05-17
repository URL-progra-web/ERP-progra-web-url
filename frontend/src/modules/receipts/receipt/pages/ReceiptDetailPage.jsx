import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiCreditCard, FiFileText, FiMapPin, FiUser } from 'react-icons/fi';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import AppCard from '~/core/components/AppCard';
import { receiptsService } from '../services/receiptsService';
import ReceiptPDFButton from '../components/ReceiptPDFButton';
import './receipt-ui.css';

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

const ReceiptDetailPage = () => {
    const { receiptId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const listPath = `${getDashboardPath(user?.role?.name)}/receipts`;

    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await receiptsService.getById(receiptId);
                setReceipt(data);
            } catch {
                setError('No se pudo cargar el recibo.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [receiptId]);

    if (isLoading) return <div className="p-3 text-muted">Cargando recibo…</div>;

    if (!receipt) {
        return (
            <div className="p-3">
                <div className="alert alert-warning">No se encontró el recibo solicitado.</div>
                <button type="button" className="btn btn-outline-dark" onClick={() => navigate(listPath)}>
                    Volver al listado
                </button>
            </div>
        );
    }

    const subtotal = Number(receipt.subtotal ?? 0);
    const shipping = Number(receipt.shipping_total ?? 0);
    const discount = Number(receipt.discount_total ?? 0);
    const grandTotal = Number(receipt.grand_total ?? 0);
    const itemsCount = receipt.items?.length ?? 0;

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title={receipt.receipt_number}
                subtitle={`Orden ${receipt.order_short_id} • ${receipt.order_status}`}
                icon={FiFileText}
                actions={
                    <>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(listPath)}
                        >
                            <FiArrowLeft className="me-1" />
                            Volver
                        </button>
                        <ReceiptPDFButton
                            receipt={receipt}
                            className="btn btn-sm btn-dark"
                        />
                    </>
                }
            />

            <div className="d-flex flex-column gap-4 receipt-detail-page">
                <div className="receipt-metrics-grid">
                    <div className="receipt-metric-card">
                        <div className="receipt-metric-card__label">Total emitido</div>
                        <div className="receipt-metric-card__value">{formatMoney(grandTotal)}</div>
                        <div className="receipt-metric-card__hint">{receipt.payment_method_name ?? 'Método no definido'}</div>
                    </div>
                    <div className="receipt-metric-card">
                        <div className="receipt-metric-card__label">Items facturados</div>
                        <div className="receipt-metric-card__value">{itemsCount}</div>
                        <div className="receipt-metric-card__hint">línea(s) dentro del recibo</div>
                    </div>
                    <div className="receipt-metric-card">
                        <div className="receipt-metric-card__label">Emitido</div>
                        <div className="receipt-metric-card__value receipt-metric-card__value--small">
                            {new Date(receipt.issued_at).toLocaleDateString()}
                        </div>
                        <div className="receipt-metric-card__hint">{receipt.issued_by_name ?? 'Sin emisor'}</div>
                    </div>
                </div>

                <div className="row g-4 align-items-start">
                    <div className="col-12 col-xl-8">
                        <div className="d-flex flex-column gap-4">
                            <AppCard accent="var(--bs-orange)">
                                <AppCard.Section label="Cliente y contexto">
                                    <div className="p-3 p-md-4">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <div className="receipt-detail-block">
                                                    <div className="receipt-detail-block__label"><FiUser size={14} /> Cliente</div>
                                                    <div className="receipt-detail-block__value">{receipt.customer?.name ?? '—'}</div>
                                                    <div className="receipt-detail-block__meta">
                                                        {receipt.customer?.email || receipt.customer?.phone || 'Sin datos adicionales'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="receipt-detail-block">
                                                    <div className="receipt-detail-block__label"><FiCreditCard size={14} /> Método de pago</div>
                                                    <div className="receipt-detail-block__value">{receipt.payment_method_name ?? '—'}</div>
                                                    <div className="receipt-detail-block__meta">Estado de la orden: {receipt.order_status ?? '—'}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="receipt-detail-block">
                                                    <div className="receipt-detail-block__label"><FiCalendar size={14} /> Emisión</div>
                                                    <div className="receipt-detail-block__value">{new Date(receipt.issued_at).toLocaleString()}</div>
                                                    <div className="receipt-detail-block__meta">Emitido por {receipt.issued_by_name ?? '—'}</div>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="receipt-detail-block">
                                                    <div className="receipt-detail-block__label"><FiMapPin size={14} /> Dirección</div>
                                                    <div className="receipt-detail-block__value">
                                                        {receipt.customer?.address || 'No hay dirección registrada'}
                                                    </div>
                                                    <div className="receipt-detail-block__meta">Pedido {receipt.order_short_id}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AppCard.Section>
                            </AppCard>

                            <AppCard accent="var(--bs-orange)">
                                <AppCard.Section label="Productos facturados">
                                    <div className="table-responsive bg-body">
                                        <table className="table mb-0 align-middle">
                                            <thead className="text-uppercase text-muted small">
                                                <tr>
                                                    <th className="border-0 px-4 py-3">SKU</th>
                                                    <th className="border-0 py-3">Cantidad</th>
                                                    <th className="border-0 py-3">UoM</th>
                                                    <th className="border-0 py-3">Precio Unitario</th>
                                                    <th className="border-0 px-4 py-3 text-end">Total Línea</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {receipt.items?.length > 0 ? (
                                                    receipt.items.map((item) => (
                                                        <tr key={item.id} className="border-bottom border-light-subtle">
                                                            <td className="px-4 py-3 fw-semibold">{item.variant_sku}</td>
                                                            <td className="py-3">{item.quantity}</td>
                                                            <td className="py-3 text-secondary">{item.selected_uom_name}</td>
                                                            <td className="py-3">{formatMoney(item.unit_price)}</td>
                                                            <td className="px-4 py-3 text-end fw-semibold">{formatMoney(item.line_total)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="5" className="text-center text-muted py-4">Sin productos en este recibo.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </AppCard.Section>
                            </AppCard>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="d-flex flex-column gap-4">
                            <AppCard accent="var(--bs-orange)">
                                <AppCard.Section label="Totales">
                                    <div className="p-3 p-md-4">
                                        <div className="receipt-total-stack">
                                            <div className="receipt-total-row">
                                                <span className="text-muted">Subtotal</span>
                                                <strong>{formatMoney(subtotal)}</strong>
                                            </div>
                                            <div className="receipt-total-row">
                                                <span className="text-muted">Envío</span>
                                                <strong>{formatMoney(shipping)}</strong>
                                            </div>
                                            {discount > 0 && (
                                                <div className="receipt-total-row text-success">
                                                    <span>Descuento</span>
                                                    <strong>- {formatMoney(discount)}</strong>
                                                </div>
                                            )}
                                            <div className="receipt-total-divider" />
                                            <div className="receipt-total-row receipt-total-row--grand">
                                                <span>Total</span>
                                                <strong>{formatMoney(grandTotal)}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </AppCard.Section>
                            </AppCard>

                            <AppCard accent="var(--bs-orange)">
                                <AppCard.Section label="Notas">
                                    <div className="p-3 p-md-4">
                                        <div className="small text-muted mb-2">Observaciones del recibo</div>
                                        <div className="receipt-notes-panel">
                                            {receipt.notes?.trim() || 'Este recibo no tiene notas registradas.'}
                                        </div>
                                    </div>
                                </AppCard.Section>
                            </AppCard>
                        </div>
                    </div>
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
        </div>
    );
};

export default ReceiptDetailPage;
