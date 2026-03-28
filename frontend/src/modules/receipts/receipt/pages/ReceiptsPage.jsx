import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText } from 'react-icons/fi';
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

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const data = await receiptsService.list({
                    page,
                    issued_at_after: fromDate || undefined,
                    issued_at_before: toDate || undefined,
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
    }, [page, fromDate, toDate]);

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Recibos"
                subtitle={`${count} recibo(s) registrado(s)`}
                icon={FiFileText}
            />

            <div className="d-flex flex-column gap-4">
                {/* FILTROS */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3">
                        <h6 className="mb-3 text-uppercase text-muted small">Filtros</h6>
                        <div className="row g-2">
                            <div className="col-md-4">
                                <label className="form-label">Desde</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={fromDate}
                                    onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Hasta</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={toDate}
                                    onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-body py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-uppercase text-muted small">Listado</h6>
                        <span className="badge bg-dark-subtle text-dark-emphasis">{count}</span>
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
