import React from 'react';
import { FiEye } from 'react-icons/fi';
import ReceiptPDFButton from './ReceiptPDFButton';
import TableActions from '~/core/components/TableActions';

const ReceiptsTable = ({ receipts, isLoading, onViewDetail }) => {
    if (isLoading) {
        return (
            <div className="table-responsive bg-body">
                <table className="table table-hover mb-0 align-middle">
                    <tbody>
                        <tr>
                            <td colSpan="7" className="text-center py-5">
                                <div className="spinner-border text-primary spinner-border-sm me-2"></div>
                                <span className="text-muted">Cargando recibos…</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="table-responsive bg-body">
            <table className="table table-hover mb-0 align-middle">
                <thead className="text-uppercase text-muted small">
                    <tr>
                        <th className="border-0 px-4 py-3">Recibo / Orden</th>
                        <th className="border-0 py-3">Cliente</th>
                        <th className="border-0 py-3">Método de Pago</th>
                        <th className="border-0 py-3">Emitido</th>
                        <th className="border-0 py-3 text-end">Total</th>
                        <th className="border-0 py-3">Fecha</th>
                        <th className="border-0 px-4 py-3 text-end">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {receipts.length > 0 ? (
                        receipts.map((item) => (
                            <tr key={item.id} className="border-bottom border-light-subtle">
                                <td className="px-4 py-3">
                                    <div className="fw-bold text-body">{item.receipt_number}</div>
                                    <small className="text-muted">Pedido {item.order_short_id ?? '—'}</small>
                                </td>
                                <td className="py-3">
                                    <div className="fw-semibold">{item.customer?.name ?? '—'}</div>
                                    <small className="text-muted">{item.customer?.email ?? item.customer?.phone ?? 'Sin dato adicional'}</small>
                                </td>
                                <td className="py-3 text-secondary">{item.payment_method_name ?? '—'}</td>
                                <td className="py-3 text-secondary">{item.issued_by_name ?? '—'}</td>
                                <td className="py-3 text-end fw-semibold">Q {Number(item.grand_total).toFixed(2)}</td>
                                <td className="py-3 text-secondary">{new Date(item.issued_at).toLocaleDateString()}</td>
                                <td className="px-4 py-3">
                                    <div className="d-flex justify-content-end align-items-center gap-2 flex-wrap">
                                        <TableActions
                                            actions={[
                                                {
                                                    icon: FiEye,
                                                    onClick: () => onViewDetail(item.id),
                                                    title: 'Ver detalle',
                                                    variant: 'primary',
                                                },
                                            ]}
                                        />
                                        <ReceiptPDFButton
                                            receipt={item}
                                            className="btn btn-sm btn-outline-secondary"
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center text-muted py-5">No hay recibos para los filtros actuales.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReceiptsTable;
