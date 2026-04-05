import React, { useState, useMemo, useEffect } from 'react';
import { FiBarChart2, FiDownload, FiUsers, FiUser, FiCalendar } from 'react-icons/fi';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import PageHeader from '~/core/components/PageHeader';
import AppAlert from '~/core/components/AppAlert';
import { useBillingReports } from '../hooks/useBillingReports';
import { userService } from '~/modules/users/services/userService';

const fmt = (n) => `Q ${Number(n ?? 0).toFixed(2)}`;

const SummaryCard = ({ label, value, sub }) => (
    <div className="card border-0 shadow-sm h-100">
        <div className="card-body">
            <p className="text-muted small text-uppercase mb-1">{label}</p>
            <p className="fw-bold fs-5 mb-0">{value}</p>
            {sub && <p className="text-muted small mb-0">{sub}</p>}
        </div>
    </div>
);

const BillingReportsPage = () => {
    const [dateAfter, setDateAfter] = useState('');
    const [dateBefore, setDateBefore] = useState('');
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);

    useEffect(() => {
        userService.getUsers({ page_size: 100 })
            .then(data => setUsers(data.results ?? data))
            .catch(() => {});
    }, []);

    const filters = useMemo(() => ({
        date_after: dateAfter || undefined,
        date_before: dateBefore || undefined,
        user_id: userId || undefined,
    }), [dateAfter, dateBefore, userId]);

    const { summary, byDay, byMonth, byCustomer, byUser, isLoading, error } = useBillingReports(filters);

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(26, 29, 33);
        doc.text('REPORTE DE FACTURACIÓN', 14, 20);
        doc.setFontSize(10);
        doc.setTextColor(100);

        const usuarioLabel = userId
            ? `Usuario: ${users.find(u => String(u.id) === String(userId))?.name ?? '—'}`
            : 'Todos los usuarios';
        doc.text(`Generado el: ${new Date().toLocaleString()} · ${usuarioLabel}`, 14, 28);

        const headStyle = { fillColor: [26, 29, 33], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' };
        const bodyStyle = { fontSize: 8, cellPadding: 3 };

        let y = 36;
        doc.setFontSize(12);
        doc.setTextColor(26, 29, 33);
        doc.text('Resumen General', 14, y);
        y += 4;

        autoTable(doc, {
            startY: y,
            head: [['Total Recibos', 'Total Facturado', 'Subtotal', 'Envíos', 'Descuentos']],
            body: [[
                summary?.total_receipts ?? 0,
                fmt(summary?.total_billed),
                fmt(summary?.total_subtotal),
                fmt(summary?.total_shipping),
                fmt(summary?.total_discounts),
            ]],
            headStyles: headStyle,
            styles: bodyStyle,
        });

        y = doc.lastAutoTable.finalY + 8;
        doc.text('Ventas por Cliente', 14, y);
        autoTable(doc, {
            startY: y + 4,
            head: [['Cliente', 'Recibos', 'Total']],
            body: byCustomer.map(r => [r.customer_name, r.count, fmt(r.total)]),
            headStyles: headStyle,
            styles: bodyStyle,
            columnStyles: { 2: { halign: 'right' } },
        });

        y = doc.lastAutoTable.finalY + 8;
        doc.text('Ventas por Usuario Emisor', 14, y);
        autoTable(doc, {
            startY: y + 4,
            head: [['Usuario', 'Recibos', 'Total']],
            body: byUser.map(r => [r.user_name, r.count, fmt(r.total)]),
            headStyles: headStyle,
            styles: bodyStyle,
            columnStyles: { 2: { halign: 'right' } },
        });

        y = doc.lastAutoTable.finalY + 8;
        doc.text('Ventas por Mes', 14, y);
        autoTable(doc, {
            startY: y + 4,
            head: [['Mes', 'Recibos', 'Total']],
            body: byMonth.map(r => [r.month, r.count, fmt(r.total)]),
            headStyles: headStyle,
            styles: bodyStyle,
            columnStyles: { 2: { halign: 'right' } },
        });

        doc.save(`Reporte_Facturacion_${new Date().toLocaleDateString()}.pdf`);
    };

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Reportes de Facturación"
                subtitle="Análisis y estadísticas de ventas"
                icon={FiBarChart2}
            />

            <div className="d-flex flex-column gap-4">
                {/* FILTROS */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body py-3">
                        <h6 className="mb-3 text-uppercase text-muted small fw-bold">Filtros</h6>
                        <div className="row g-2">
                            <div className="col-md-3">
                                <label className="form-label small text-muted">Desde</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={dateAfter}
                                    onChange={(e) => setDateAfter(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted">Hasta</label>
                                <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={dateBefore}
                                    onChange={(e) => setDateBefore(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small text-muted">Usuario</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                >
                                    <option value="">Todos los usuarios</option>
                                    {users.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-3 d-flex align-items-end">
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm d-flex align-items-center gap-2 px-3 shadow-sm w-100"
                                    style={{ backgroundColor: '#dc3545', border: 'none', fontWeight: '500' }}
                                    onClick={downloadPDF}
                                    disabled={isLoading || !summary}
                                >
                                    <FiDownload /> Exportar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-muted p-3">Cargando reportes...</div>
                ) : (
                    <>
                        {/* RESUMEN */}
                        <div className="row g-3">
                            <div className="col-6 col-md-4">
                                <SummaryCard label="Total Recibos" value={summary?.total_receipts ?? 0} />
                            </div>
                            <div className="col-6 col-md-4">
                                <SummaryCard label="Total Facturado" value={fmt(summary?.total_billed)} />
                            </div>
                            <div className="col-6 col-md-4">
                                <SummaryCard label="Subtotal" value={fmt(summary?.total_subtotal)} />
                            </div>
                            <div className="col-6 col-md-4">
                                <SummaryCard label="Total Envíos" value={fmt(summary?.total_shipping)} />
                            </div>
                            <div className="col-6 col-md-4">
                                <SummaryCard label="Total Descuentos" value={fmt(summary?.total_discounts)} />
                            </div>
                        </div>

                        {/* VENTAS POR MES */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-body py-3 d-flex align-items-center gap-2">
                                <FiCalendar className="text-muted" />
                                <h6 className="mb-0 text-uppercase text-muted small fw-bold">Ventas por Mes</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Mes</th>
                                            <th>Recibos</th>
                                            <th className="text-end">Total Facturado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byMonth.length > 0 ? byMonth.map((row) => (
                                            <tr key={row.month}>
                                                <td>{row.month}</td>
                                                <td>{row.count}</td>
                                                <td className="text-end">{fmt(row.total)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="text-center text-muted py-3">Sin datos.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* VENTAS POR DÍA */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-body py-3 d-flex align-items-center gap-2">
                                <FiCalendar className="text-muted" />
                                <h6 className="mb-0 text-uppercase text-muted small fw-bold">Ventas por Día</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Recibos</th>
                                            <th className="text-end">Total Facturado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byDay.length > 0 ? byDay.map((row) => (
                                            <tr key={row.day}>
                                                <td>{row.day}</td>
                                                <td>{row.count}</td>
                                                <td className="text-end">{fmt(row.total)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="text-center text-muted py-3">Sin datos.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* VENTAS POR CLIENTE */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-body py-3 d-flex align-items-center gap-2">
                                <FiUsers className="text-muted" />
                                <h6 className="mb-0 text-uppercase text-muted small fw-bold">Ventas por Cliente</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Cliente</th>
                                            <th>Recibos</th>
                                            <th className="text-end">Total Facturado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byCustomer.length > 0 ? byCustomer.map((row) => (
                                            <tr key={row.customer_id}>
                                                <td>{row.customer_name}</td>
                                                <td>{row.count}</td>
                                                <td className="text-end">{fmt(row.total)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="text-center text-muted py-3">Sin datos.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* VENTAS POR USUARIO */}
                        <div className="card border-0 shadow-sm">
                            <div className="card-header bg-body py-3 d-flex align-items-center gap-2">
                                <FiUser className="text-muted" />
                                <h6 className="mb-0 text-uppercase text-muted small fw-bold">Ventas por Usuario Emisor</h6>
                            </div>
                            <div className="table-responsive">
                                <table className="table mb-0">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Recibos</th>
                                            <th className="text-end">Total Facturado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {byUser.length > 0 ? byUser.map((row) => (
                                            <tr key={row.user_id}>
                                                <td>{row.user_name}</td>
                                                <td>{row.count}</td>
                                                <td className="text-end">{fmt(row.total)}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="3" className="text-center text-muted py-3">Sin datos.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {error && (
                <AppAlert
                    type="danger"
                    header="Error"
                    content={error}
                    onClose={() => {}}
                />
            )}
        </div>
    );
};

export default BillingReportsPage;