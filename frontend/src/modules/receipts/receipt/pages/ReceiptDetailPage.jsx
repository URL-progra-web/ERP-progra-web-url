import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import { receiptsService } from '../services/receiptsService';

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

    if (isLoading) return <div className="p-3 text-muted">Cargando recibo...</div>;

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

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title={receipt.receipt_number}
                subtitle={`Orden ${receipt.order_short_id} • ${receipt.order_status}`}
                icon={FiFileText}
                actionLabel="Volver"
                actionIcon={FiArrowLeft}
                onAction={() => navigate(listPath)}
            />

            <div className="d-flex flex-column gap-4">
                {/* DATOS GENERALES */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3">
                        <h6 className="mb-0 text-uppercase text-muted small">Información General</h6>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Cliente</label>
                                <p className="mb-0 fw-semibold">{receipt.customer?.name ?? '—'}</p>
                                <small className="text-muted">{receipt.customer?.email ?? ''}</small>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Método de Pago</label>
                                <p className="mb-0">{receipt.payment_method_name ?? '—'}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Emitido por</label>
                                <p className="mb-0">{receipt.issued_by_name ?? '—'}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-muted small">Fecha de emisión</label>
                                <p className="mb-0">{new Date(receipt.issued_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ITEMS */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3">
                        <h6 className="mb-0 text-uppercase text-muted small">Productos</h6>
                    </div>
                    <table className="table mb-0">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Cantidad</th>
                                <th>UoM</th>
                                <th>Precio Unitario</th>
                                <th className="text-end">Total Línea</th>
                            </tr>
                        </thead>
                        <tbody>
                            {receipt.items?.length > 0 ? (
                                receipt.items.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.variant_sku}</td>
                                        <td>{item.quantity}</td>
                                        <td>{item.selected_uom_name}</td>
                                        <td>Q {Number(item.unit_price).toFixed(2)}</td>
                                        <td className="text-end">Q {Number(item.line_total).toFixed(2)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-3">Sin productos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* TOTALES */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex flex-column gap-1" style={{ maxWidth: 320, marginLeft: 'auto' }}>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Subtotal</span>
                                <span>Q {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="text-muted">Envío</span>
                                <span>Q {shipping.toFixed(2)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="d-flex justify-content-between text-success">
                                    <span>Descuento</span>
                                    <span>- Q {discount.toFixed(2)}</span>
                                </div>
                            )}
                            <hr className="my-1" />
                            <div className="d-flex justify-content-between fw-bold fs-5">
                                <span>Total</span>
                                <span>Q {grandTotal.toFixed(2)}</span>
                            </div>
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
