import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiDownload } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '~/core/auth/AuthContext';
import { getDashboardPath } from '~/core/registry/dashboardPaths';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import AppPagination from '~/core/components/AppPagination';
import AppCard from '~/core/components/AppCard';
import { DEFAULT_PAGE_SIZE } from '~/core/constants/pagination';
import ReceiptsTable from '../components/ReceiptsTable';
import { receiptsService } from '../services/receiptsService';
import './receipt-ui.css';

const formatMoney = (value) => `Q ${Number(value ?? 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`;

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
                    page_size: DEFAULT_PAGE_SIZE,
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

    const listedGrandTotal = useMemo(() => receipts.reduce(
        (sum, item) => sum + Number(item.grand_total ?? 0),
        0,
    ), [receipts]);

    const listedAverageTicket = useMemo(() => {
        if (!receipts.length) return 0;
        return listedGrandTotal / receipts.length;
    }, [listedGrandTotal, receipts.length]);

    const activeRangeLabel = useMemo(() => {
        if (fromDate && toDate) return `${fromDate} → ${toDate}`;
        if (fromDate) return `Desde ${fromDate}`;
        if (toDate) return `Hasta ${toDate}`;
        return 'Todo el periodo';
    }, [fromDate, toDate]);

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

            <div className="d-flex flex-column gap-4 receipts-page">
                <div className="receipt-metrics-grid">
                    <div className="receipt-metric-card">
                        <div className="receipt-metric-card__label">Recibos visibles</div>
                        <div className="receipt-metric-card__value">{receipts.length}</div>
                        <div className="receipt-metric-card__hint">de {count} total en el listado</div>
                    </div>
                    <div className="receipt-metric-card">
                        <div className="receipt-metric-card__label">Facturación visible</div>
                        <div className="receipt-metric-card__value">{formatMoney(listedGrandTotal)}</div>
                        <div className="receipt-metric-card__hint">solo lo cargado en esta página</div>
                    </div>
                    <div className="receipt-metric-card">
                        <div className="receipt-metric-card__label">Ticket promedio</div>
                        <div className="receipt-metric-card__value">{formatMoney(listedAverageTicket)}</div>
                        <div className="receipt-metric-card__hint">{activeRangeLabel}</div>
                    </div>
                </div>

                <AppCard accent="var(--bs-orange)">
                    <AppCard.Section label="Filtros">
                        <div className="p-3 p-md-4 border-bottom">
                            <div className="receipt-section-copy mb-3">
                                <div className="fw-semibold">Localiza recibos por rango y cliente.</div>
                                <div className="small text-muted">
                                    Usa el rango de fechas para cerrar periodos y el texto para ubicar cliente o número rápidamente.
                                </div>
                            </div>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="receipts-from-date" className="form-label small text-muted">Desde</label>
                                    <input
                                        id="receipts-from-date"
                                        type="date"
                                        className="form-control"
                                        value={fromDate}
                                        onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="receipts-to-date" className="form-label small text-muted">Hasta</label>
                                    <input
                                        id="receipts-to-date"
                                        type="date"
                                        className="form-control"
                                        value={toDate}
                                        onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="receipts-search" className="form-label small text-muted">Buscar</label>
                                    <input
                                        id="receipts-search"
                                        type="text"
                                        className="form-control"
                                        placeholder="Cliente o número de recibo"
                                        value={client}
                                        onChange={(e) => { setClient(e.target.value); setPage(1); }}
                                    />
                                </div>
                            </div>
                        </div>
                    </AppCard.Section>

                    <AppCard.Section label="Listado">
                        <div className="receipt-list-toolbar">
                            <div>
                                <div className="fw-semibold">Recibos emitidos</div>
                                <div className="small text-muted">
                                    {count} registro(s) encontrados · {activeRangeLabel}
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-dark btn-sm d-flex align-items-center gap-2"
                                onClick={downloadAllReceiptsPDF}
                                disabled={isLoading || receipts.length === 0}
                            >
                                <FiDownload /> Exportar PDF
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
                    </AppCard.Section>
                </AppCard>
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
