import React from 'react';
import ReceiptPDFButton from './ReceiptPDFButton'; // Importamos el componente

const ReceiptsTable = ({ receipts, isLoading, onViewDetail }) => {
    if (isLoading) return <div className="p-3 text-muted">Cargando recibos...</div>;

    return (
        <table className="table table-hover mb-0">
            <thead>
                <tr>
                    <th># Recibo</th>
                    <th>Cliente</th>
                    <th>Método de Pago</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Acción</th> {/* Nueva Columna */}
                </tr>
            </thead>
            <tbody>
                {receipts.length > 0 ? (
                    receipts.map((item) => (
                        <tr 
                            key={item.id} 
                            style={{ cursor: 'pointer' }} 
                            onClick={() => onViewDetail(item.id)}
                        >
                            <td className="align-middle">{item.receipt_number}</td>
                            <td className="align-middle">{item.customer?.name ?? '—'}</td>
                            <td className="align-middle">{item.payment_method_name ?? '—'}</td>
                            <td className="align-middle">Q {Number(item.grand_total).toFixed(2)}</td>
                            <td className="align-middle">{new Date(item.issued_at).toLocaleDateString()}</td>
                            <td className="align-middle"><ReceiptPDFButton receipt={item} /></td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center text-muted py-4">No hay recibos.</td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default ReceiptsTable;