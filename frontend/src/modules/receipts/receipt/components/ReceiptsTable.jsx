import React from 'react';

const ReceiptsTable = ({ receipts, isLoading, onViewDetail }) => {
    if (isLoading) {
        return <div className="p-3 text-muted">Cargando recibos...</div>;
    }

    return (
        <table className="table table-hover mb-0">
            <thead>
                <tr>
                    <th># Recibo</th>
                    <th>Cliente</th>
                    <th>Método de Pago</th>
                    <th>Emitido por</th>
                    <th>Total</th>
                    <th>Fecha</th>
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
                            <td>{item.receipt_number}</td>
                            <td>{item.customer?.name ?? '—'}</td>
                            <td>{item.payment_method_name ?? '—'}</td>
                            <td>{item.issued_by_name ?? '—'}</td>
                            <td>Q {Number(item.grand_total).toFixed(2)}</td>
                            <td>{new Date(item.issued_at).toLocaleDateString()}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="text-center text-muted py-4">
                            No hay recibos registrados.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default ReceiptsTable;
