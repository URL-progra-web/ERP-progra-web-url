import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import AppPagination from '~/core/components/AppPagination';
import ReceiptsTable from '../components/ReceiptsTable';
import { receiptsService } from '../services/receiptsService';

const ReceiptsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const basePath = getDashboardPath(user?.role?.name);

    const [receipts, setReceipts] = useState([]);
    const [count, setCount] = useState(0);
    const [numPages, setNumPages] = useState(1);
    const [page, setPage] = useState(1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [client, setClient] = useState('');

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await receiptsService.list({
                    page,
                    issued_at_after: fromDate || undefined,
                    issued_at_before: toDate || undefined,
                    client: client || undefined,
                });

                setReceipts(data.results ?? data);
                setCount(data.count ?? (data.results ?? data).length);
                setNumPages(data.num_pages ?? 1);
            } catch {
                setError('No se pudieron cargar los recibos.');
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [page, fromDate, toDate, client]);

    // Función para descargar el reporte masivo con los colores del sistema
    const downloadAllReceiptsPDF = () => {
        if (receipts.length === 0) return;

        try {
            const doc = new jsPDF();
            
            // Título
            doc.setFontSize(18);
            doc.setTextColor(26, 29, 33); // Color #1a1d21 de tu ERP
            doc.text("REPORTE GENERAL DE RECIBOS", 14, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);

            // Tabla masiva con estilo oscuro (igual que tu encabezado de tabla en el ERP)
            autoTable(doc, {
                startY: 35,
                head: [['# RECIBO', 'CLIENTE', 'MÉTODO DE PAGO', 'EMITIDO POR', 'TOTAL', 'FECHA']],
                body: receipts.map(item => [
                    item.receipt_number,
                    item.customer?.name ?? '—',
                    item.payment_method_name ?? '—',
                    item.issued_by_name ?? '—',
                    `Q ${Number(item.grand_total).toFixed(2)}`,
                    new Date(item.issued_at).toLocaleDateString()
                ]),
                theme: 'striped',
                headStyles: { 
                    fillColor: [26, 29, 33], // Color oscuro del ERP #1a1d21
                    textColor: [255, 255, 255],
                    fontSize: 8,
                    fontStyle: 'bold'
                },
                styles: { fontSize: 8, cellPadding: 3 },
                columnStyles: {
                    4: { halign: 'right' }
                }
            });

            doc.save(`Reporte_Recibos_${new Date().toLocaleDateString()}.pdf`);
        } catch (err) {
            setError("No se pudo generar el reporte masivo.");
        }
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Recibos"
                subtitle={`${count} recibo(s) registrado(s)`}
                icon={FiFileText}
            />

            <div className="d-flex flex-column gap-4">
                {/* FILTROS */}
                <div className="card border-0 shadow-sm" style={{ backgroundColor: '#1a1d21' }}>
                    <div className="card-body py-3">
                        <h6 className="mb-3 text-uppercase text-white-50 small fw-bold">Filtros</h6>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <label className="form-label text-white-50 small">Desde</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm bg-dark border-secondary text-white"
                                    value={fromDate}
                                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-white-50 small">Hasta</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm bg-dark border-secondary text-white"
                                    value={toDate}
                                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-white-50 small">Buscar</label>
                                <input
                                    type="text"
                                    className="form-control form-control-sm bg-dark border-secondary text-white"
                                    placeholder="Buscar cliente o número..."
                                    value={client}
                                    onChange={(e) => { setClient(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                            <h6 className="mb-0 text-uppercase text-muted small fw-bold">Listado</h6>
                            <span className="badge bg-secondary-subtle text-secondary small">{count}</span>
                        </div>
                        
                        {/* Botón Rojo (Referencia Imagen) */}
                        <button 
                            type="button"
                            className="btn btn-danger btn-sm d-flex align-items-center gap-2 px-3 shadow-sm"
                            style={{ backgroundColor: '#dc3545', border: 'none', fontWeight: '500' }}
                            onClick={downloadAllReceiptsPDF}
                            disabled={isLoading || receipts.length === 0}
                        >
                            <FiDownload /> PDF
                        </button>
                    </div>

                    <ReceiptsTable
                        receipts={receipts}
                        isLoading={isLoading}
                        onViewDetail={(id) => navigate(`${basePath}/receipts/detail/${id}`)}
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
        </div>
    );
};

export default ReceiptsPage;