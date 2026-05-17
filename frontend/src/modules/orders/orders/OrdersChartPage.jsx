import React from 'react';
import { FiBarChart2, FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { useOrdersChart } from './hooks/useOrdersChart';
import { useOrdersCumulative } from './hooks/useOrdersCumulative';
import OrdersBarChart from './components/OrdersBarChart';
import OrdersLineChart from './components/OrdersLineChart';
import AppCard from '~/core/components/AppCard';
import PageHeader from '~/core/components/PageHeader';

// ── helpers ──────────────────────────────────────────────────────
function todayStr() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}
function daysAgoStr(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
}

// ── color helpers ─────────────────────────────────────────────────
const STATUS_COLORS = {
    SOLICITADO: '#f59e0b',
    CONFIRMADO: '#6366f1',
    ENVIADO:    '#3b82f6',
    ENTREGADO:  '#10b981',
    CANCELADO:  '#ef4444',
    BORRADOR:   '#94a3b8',
};
const PALETTE = ['#6366f1','#f59e0b','#10b981','#ef4444','#3b82f6','#8b5cf6','#ec4899','#14b8a6'];
function colorFor(name, index) {
    return STATUS_COLORS[name.toUpperCase()] ?? PALETTE[index % PALETTE.length];
}

// ── sub-components ────────────────────────────────────────────────
const StatusToggle = ({ label, color, active, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', fontSize: 12,
            fontWeight: active ? 700 : 500, borderRadius: 20,
            border: `2px solid ${active ? color : 'var(--bs-border-color)'}`,
            background: active ? `${color}22` : 'transparent',
            color: active ? color : 'var(--bs-secondary-color)',
            cursor: 'pointer', transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
        }}
    >
        <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: active ? color : 'var(--bs-border-color)',
            flexShrink: 0, transition: 'background 0.15s',
        }} />
        {label}
    </button>
);

const SummaryBadges = ({ chartData, activeStatuses }) => {
    if (!chartData.series.length || !activeStatuses.length) return null;
    return (
        <div className="d-flex flex-wrap gap-3 mb-4">
            {activeStatuses.map((s, i) => {
                const vals = chartData.series.map(d => d[s] ?? 0);
                const last = vals[vals.length - 1] ?? 0;
                const color = colorFor(s, i);
                return (
                    <div key={s}
                        className="d-flex align-items-center gap-2 rounded-3 px-3 py-2"
                        style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: 'var(--bs-secondary-color)' }}>{s}</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color }}>{last}</span>
                    </div>
                );
            })}
        </div>
    );
};

const QUICK_RANGES = [
    { label: 'Hoy',           value: 'today' },
    { label: 'Últimos 7d',    value: '7d' },
    { label: 'Últimos 30d',   value: '30d' },
    { label: 'Personalizado', value: 'custom' },
];

const CHART_TABS = [
    { value: 'daily',      label: 'Por día',    icon: FiBarChart2,   desc: 'Pedidos nuevos por estado cada día' },
    { value: 'cumulative', label: 'Acumulado',  icon: FiTrendingUp,  desc: 'Crecimiento total acumulado por estado' },
];

// ── main component ────────────────────────────────────────────────
const OrdersChartPage = () => {
    // chart type tab
    const [chartTab, setChartTab] = React.useState('daily');

    // date range
    const [quickRange, setQuickRange] = React.useState('30d');
    const [customFrom, setCustomFrom] = React.useState(() => daysAgoStr(30));
    const [customTo,   setCustomTo]   = React.useState(() => todayStr());

    const { dateFrom, dateTo } = React.useMemo(() => {
        if (quickRange === 'today') return { dateFrom: todayStr(),     dateTo: todayStr() };
        if (quickRange === '7d')    return { dateFrom: daysAgoStr(7),  dateTo: todayStr() };
        if (quickRange === '30d')   return { dateFrom: daysAgoStr(30), dateTo: todayStr() };
        return { dateFrom: customFrom, dateTo: customTo };
    }, [quickRange, customFrom, customTo]);

    // status filter — shared between both chart modes
    const [availableStatuses, setAvailableStatuses] = React.useState([]);
    const [activeStatuses,    setActiveStatuses]    = React.useState([]);
    const [initialLoaded,     setInitialLoaded]     = React.useState(false);

    // hooks for both chart types
    const daily = useOrdersChart({
        dateFrom, dateTo,
        statuses: activeStatuses,
        autoFetch: chartTab === 'daily',
    });
    const cumulative = useOrdersCumulative({
        dateFrom, dateTo,
        statuses: activeStatuses,
        autoFetch: chartTab === 'cumulative',
    });

    const active = chartTab === 'daily' ? daily : cumulative;

    // Seed available statuses from first successful fetch
    React.useEffect(() => {
        const statuses = active.chartData.statuses;
        if (!statuses.length) return;
        if (!initialLoaded) {
            setAvailableStatuses(statuses);
            setActiveStatuses(statuses);
            setInitialLoaded(true);
        } else {
            setAvailableStatuses(prev => {
                const merged = [...new Set([...prev, ...statuses])].toSorted();
                return merged;
            });
        }
    }, [active.chartData.statuses, initialLoaded]);

    // When switching tabs, trigger fetch if not yet loaded
    const handleTabChange = (tab) => {
        setChartTab(tab);
        if (tab === 'daily')      daily.fetchStats();
        if (tab === 'cumulative') cumulative.fetchStats();
    };

    const toggleStatus = (name) =>
        setActiveStatuses(prev =>
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );

    const toggleAll = () =>
        setActiveStatuses(prev =>
            prev.length === availableStatuses.length ? [] : [...availableStatuses]
        );

    return (
        <div className="container-fluid p-0">
            <PageHeader
                title="Estadísticas de Pedidos"
                subtitle="Análisis histórico de pedidos por estado"
                icon={FiBarChart2}
                isDark
            />

            <AppCard accent="var(--bs-indigo)">

                {/* ── Chart type tabs ── */}
                <AppCard.Section label="Tipo de gráfico">
                    <div className="p-3 d-flex gap-2 border-bottom">
                        {CHART_TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = chartTab === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    type="button"
                                    id={`chartTab-${tab.value}`}
                                    onClick={() => handleTabChange(tab.value)}
                                    className={`btn btn-sm d-flex align-items-center gap-2 ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    title={tab.desc}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                        <span className="ms-2 align-self-center text-secondary" style={{ fontSize: 12 }}>
                            {CHART_TABS.find(t => t.value === chartTab)?.desc}
                        </span>
                    </div>
                </AppCard.Section>

                {/* ── Filters ── */}
                <AppCard.Section label="Filtros">
                    <div className="p-3 p-md-4 border-bottom">
                        <div className="row g-3 align-items-end">

                            <div className="col-12 col-md-auto">
                                <p className="form-label fw-semibold mb-1" style={{ fontSize: 12 }}>
                                    Rango de fechas
                                </p>
                                <div className="d-flex gap-2 flex-wrap">
                                    {QUICK_RANGES.map(r => (
                                        <button
                                            key={r.value}
                                            type="button"
                                            className={`btn btn-sm ${quickRange === r.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => setQuickRange(r.value)}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {quickRange === 'custom' && (
                                <>
                                    <div className="col-auto">
                                        <label htmlFor="chartDateFrom" className="form-label fw-semibold mb-1" style={{ fontSize: 12 }}>Desde</label>
                                        <input id="chartDateFrom" type="date" className="form-control form-control-sm"
                                            value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                                    </div>
                                    <div className="col-auto">
                                        <label htmlFor="chartDateTo" className="form-label fw-semibold mb-1" style={{ fontSize: 12 }}>Hasta</label>
                                        <input id="chartDateTo" type="date" className="form-control form-control-sm"
                                            value={customTo} onChange={e => setCustomTo(e.target.value)} />
                                    </div>
                                </>
                            )}

                            <div className="col-auto ms-md-auto">
                                <button
                                    id="btnRefreshChart"
                                    type="button"
                                    className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2"
                                    onClick={active.fetchStats}
                                    disabled={active.isLoading}
                                >
                                    <FiRefreshCw className={active.isLoading ? 'spin' : ''} />
                                    {active.isLoading ? 'Cargando…' : 'Actualizar'}
                                </button>
                            </div>
                        </div>

                        {availableStatuses.length > 0 && (
                            <div className="mt-3">
                                <span className="fw-semibold me-2" style={{ fontSize: 12 }}>Estados:</span>
                                <div className="d-inline-flex flex-wrap gap-2 align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-link p-0 text-decoration-none"
                                        style={{ fontSize: 12 }}
                                        onClick={toggleAll}
                                    >
                                        {activeStatuses.length === availableStatuses.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                    </button>
                                    {availableStatuses.map((s, i) => (
                                        <StatusToggle
                                            key={s}
                                            label={s}
                                            color={colorFor(s, i)}
                                            active={activeStatuses.includes(s)}
                                            onClick={() => toggleStatus(s)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </AppCard.Section>

                {/* ── Chart area ── */}
                <AppCard.Section label={chartTab === 'daily' ? 'Pedidos por día' : 'Evolución acumulada'}>
                    <div className="p-3 p-md-4">
                        {active.error && (
                            <div className="alert alert-danger py-2" role="alert">{active.error}</div>
                        )}

                        {active.isLoading && !active.chartData.series.length ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: 340 }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando…</span>
                                </div>
                            </div>
                        ) : (
                            <>
                                <SummaryBadges
                                    chartData={active.chartData}
                                    activeStatuses={activeStatuses}
                                />

                                {chartTab === 'daily' && active.chartData.statuses.length > 0 && (
                                    <p className="text-secondary mb-3" style={{ fontSize: 12 }}>
                                        Cada barra muestra cuántos pedidos <strong>se crearon</strong> con ese estado en ese día específico.
                                    </p>
                                )}
                                {chartTab === 'cumulative' && active.chartData.statuses.length > 0 && (
                                    <p className="text-secondary mb-3" style={{ fontSize: 12 }}>
                                        Cada punto muestra el <strong>total acumulado</strong> de pedidos con ese estado hasta esa fecha.
                                    </p>
                                )}

                                {!activeStatuses.length && initialLoaded ? (
                                    <div className="alert alert-warning py-3 text-center" role="alert">
                                        Por favor, selecciona al menos un estado en los filtros de arriba para visualizar los datos.
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative', opacity: active.isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                                        {chartTab === 'daily' ? (
                                            <OrdersBarChart
                                                series={active.chartData.series}
                                                statuses={activeStatuses}
                                                height={340}
                                            />
                                        ) : (
                                            <OrdersLineChart
                                                series={active.chartData.series}
                                                statuses={activeStatuses}
                                                height={340}
                                            />
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </AppCard.Section>

            </AppCard>
        </div>
    );
};

export default OrdersChartPage;
