import { useState, useEffect } from "react";

const API = "http://localhost:8000/api/orders";
const getToken = () => localStorage.getItem("access_token");

const STATUS_MAP = {
  "solicitado":  { bg: "#FEF3C7", text: "#92400E", border: "#F59E0B" },
  "pendiente":   { bg: "#FAEEDA", text: "#854F0B", border: "#EF9F27" },
  "confirmado":  { bg: "#DBEAFE", text: "#1E40AF", border: "#3B82F6" },
  "en proceso":  { bg: "#EDE9FE", text: "#5B21B6", border: "#8B5CF6" },
  "enviado":     { bg: "#D1FAE5", text: "#065F46", border: "#10B981" },
  "entregado":   { bg: "#DCFCE7", text: "#166534", border: "#22C55E" },
  "cancelado":   { bg: "#FEE2E2", text: "#991B1B", border: "#EF4444" },
};
const DEF_STYLE = { bg: "#F3F4F6", text: "#374151", border: "#9CA3AF" };

const getStyle   = (n = "") => STATUS_MAP[n.toLowerCase()] || DEF_STYLE;
const getStatus  = (o) => o.status_name ?? "";
const getClient  = (o) => o.customer_name ?? `Cliente #${o.customer}` ?? "—";
const getPayment = (o) => o.payment_method_name ?? "N/A";
const getTotal   = (o) => parseFloat(o.total_amount ?? 0);
const getId      = (o) => o.short_id ?? `#${o.id}`;

// Convierte fecha UTC del backend a fecha local Guatemala (UTC-6)
const toGuatemala = (dateStr) => {
  const d = new Date(dateStr);
  d.setHours(d.getHours() - 6);
  return d;
};

function Badge({ name }) {
  const s = getStyle(name);
  return (
    <span style={{
      background: s.bg, color: s.text, border: `1px solid ${s.border}`,
      borderRadius: 5, padding: "2px 10px", fontSize: 11, fontWeight: 600,
      whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.3px"
    }}>{name || "—"}</span>
  );
}

function MetricCard({ label, value, sub }) {
  return (
    <div style={{
      flex: 1, minWidth: 140, background: "#fff",
      border: "1px solid #E5E7EB", borderRadius: 10, padding: "1rem 1.25rem"
    }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</p>
      <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "#9CA3AF", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

const RANGES = [
  { label: "Semanal",    days: 7 },
  { label: "Mensual",    days: 30 },
  { label: "Trimestral", days: 90 },
  { label: "Semestral",  days: 180 },
  { label: "Anual",      days: 365 },
];

function toInputDate(d) {
  return d.toISOString().split("T")[0];
}

export default function OrdersReport() {
  const [orders,      setOrders]      = useState([]);
  const [statuses,    setStatuses]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [sortCol,     setSortCol]     = useState("created_at");
  const [sortDir,     setSortDir]     = useState("desc");
  const [dateFrom,    setDateFrom]    = useState("");
  const [dateTo,      setDateTo]      = useState("");
  const [activeRange, setActiveRange] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` };
    Promise.all([
      fetch(`${API}/`,          { headers }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
      fetch(`${API}/statuses/`, { headers }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }),
    ])
      .then(([o, s]) => {
        setOrders(Array.isArray(o) ? o : o.results ?? []);
        setStatuses(Array.isArray(s) ? s : s.results ?? []);
      })
      .catch(e => setError(`Error al conectar con el backend: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const applyRange = (days) => {
    const to   = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(toInputDate(from));
    setDateTo(toInputDate(to));
    setActiveRange(days);
  };

  const clearRange = () => { setDateFrom(""); setDateTo(""); setActiveRange(null); };

  const filtered = orders.filter(o => {
    if (filter !== "all" && getStatus(o) !== filter) return false;
    const q = search.toLowerCase();
    if (q && !getId(o).toLowerCase().includes(q) && !getClient(o).toLowerCase().includes(q)) return false;

    const orderDate = toGuatemala(o.created_at);

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (orderDate < from) return false;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (orderDate > to) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const val = o => {
      if (sortCol === "total")      return getTotal(o);
      if (sortCol === "created_at") return new Date(o.created_at ?? 0);
      if (sortCol === "client")     return getClient(o).toLowerCase();
      return getId(o).toLowerCase();
    };
    const [av, bv] = [val(a), val(b)];
    return av < bv ? (sortDir === "asc" ? -1 : 1) : av > bv ? (sortDir === "asc" ? 1 : -1) : 0;
  });

  const totalQ    = filtered.reduce((s, o) => s + getTotal(o), 0);
  const chartData = statuses
    .map(s => ({ name: s.name, count: filtered.filter(o => getStatus(o) === s.name).length }))
    .filter(d => d.count > 0);

  const handleSort = col => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const exportPDF = () => {
    const fecha  = new Date().toLocaleDateString("es-GT").replace(/\//g, "-");
    const titulo = `Reporte-Pedidos-${fecha}`;

    const filas = sorted.map(o => `
      <tr>
        <td>${getId(o)}</td>
        <td>${getClient(o)}</td>
        <td>${getStatus(o)}</td>
        <td>${getPayment(o)}</td>
        <td style="text-align:right">Q ${getTotal(o).toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
        <td>${o.created_at ? toGuatemala(o.created_at).toLocaleDateString("es-GT") : "—"}</td>
      </tr>
    `).join("");

    const metricas = [
      { label: "Total pedidos", value: filtered.length },
      { label: "Monto total",   value: `Q ${totalQ.toLocaleString("es-GT", { minimumFractionDigits: 2 })}` },
      ...chartData.map(d => ({ label: d.name, value: d.count })),
    ].map(m => `
      <div class="metric">
        <label>${m.label}</label>
        <span>${m.value}</span>
      </div>
    `).join("");

    const periodo = dateFrom && dateTo
      ? `Período: ${dateFrom} al ${dateTo}`
      : "Todos los períodos";

    const ventana = window.open("", "_blank");
    ventana.document.write(`
      <html>
      <head>
        <title>${titulo}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; padding: 32px; color: #111; font-size: 13px; }
          h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
          .sub { color: #6B7280; font-size: 12px; margin-bottom: 24px; }
          .metrics { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
          .metric { border: 1px solid #E5E7EB; border-radius: 8px; padding: 12px 16px; min-width: 130px; }
          .metric label { font-size: 10px; text-transform: uppercase; color: #6B7280; display: block; margin-bottom: 4px; letter-spacing: 0.5px; font-weight: 600; }
          .metric span { font-size: 20px; font-weight: 700; color: #111; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #F3F4F6; padding: 9px 12px; text-align: left; font-size: 10px; text-transform: uppercase; border-bottom: 2px solid #E5E7EB; letter-spacing: 0.4px; color: #6B7280; }
          td { padding: 9px 12px; border-bottom: 1px solid #F3F4F6; }
          tr:nth-child(even) td { background: #FAFAFA; }
          tfoot td { font-weight: 700; background: #F9FAFB !important; border-top: 2px solid #E5E7EB; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h2>Reporte de Pedidos</h2>
        <p class="sub">
          ${periodo}
          ${filter !== "all" ? ` &nbsp;|&nbsp; Estado: ${filter}` : ""}
          &nbsp;|&nbsp; Generado: ${new Date().toLocaleDateString("es-GT")}
        </p>
        <div class="metrics">${metricas}</div>
        <table>
          <thead>
            <tr>
              <th># Orden</th><th>Cliente</th><th>Estado</th>
              <th>Método de Pago</th><th>Total</th><th>Fecha</th>
            </tr>
          </thead>
          <tbody>${filas}</tbody>
          <tfoot>
            <tr>
              <td colspan="4">TOTAL</td>
              <td style="text-align:right">Q ${totalQ.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <script>window.onload = () => { document.title = "${titulo}"; window.print(); }<\/script>
      </body>
      </html>
    `);
    ventana.document.close();
  };

  const th = (col, right = false) => ({
    padding: "10px 14px", textAlign: right ? "right" : "left",
    fontSize: 11, color: "#6B7280", fontWeight: 600,
    borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap",
    cursor: "pointer", userSelect: "none", textTransform: "uppercase",
    letterSpacing: "0.4px", background: "#F9FAFB",
  });

  const Arrow = ({ col }) => sortCol !== col ? " ↕" : sortDir === "asc" ? " ↑" : " ↓";

  const btnRange = (days) => ({
    padding: "7px 16px", fontSize: 13, border: "1px solid", borderRadius: 6,
    cursor: "pointer", fontWeight: activeRange === days ? 600 : 400,
    background: activeRange === days ? "#1D4ED8" : "#fff",
    color: activeRange === days ? "#fff" : "#374151",
    borderColor: activeRange === days ? "#1D4ED8" : "#D1D5DB",
  });

  if (loading) return <div style={{ padding: "3rem", textAlign: "center", color: "#6B7280" }}>Cargando reporte...</div>;
  if (error)   return <div style={{ margin: "1rem", padding: "1rem", background: "#FEF2F2", color: "#991B1B", border: "1px solid #FCA5A5", borderRadius: 8 }}>{error}</div>;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "1rem 1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ width: 42, height: 42, background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="20" height="20" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Reporte de Pedidos</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#6B7280" }}>Análisis y seguimiento de pedidos por estado</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px" }}>FILTROS</p>
        <p style={{ fontSize: 13, color: "#6B7280", margin: "0 0 8px" }}>Rango rápido</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {RANGES.map(r => (
            <button key={r.days} style={btnRange(r.days)} onClick={() => activeRange === r.days ? clearRange() : applyRange(r.days)}>
              {r.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13, color: "#374151" }}>Desde</label>
            <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setActiveRange(null); }}
              style={{ padding: "7px 10px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13, color: "#374151" }}>Hasta</label>
            <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setActiveRange(null); }}
              style={{ padding: "7px 10px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 13, color: "#374151" }}>Estado</label>
            <select value={filter} onChange={e => setFilter(e.target.value)}
              style={{ padding: "7px 10px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13, minWidth: 160 }}>
              <option value="all">Todos los estados</option>
              {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: 13, color: "#374151" }}>Buscar cliente / # orden</label>
            <input type="text" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: "7px 10px", border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 13 }} />
          </div>
          <button onClick={exportPDF} style={{
            padding: "8px 18px", background: "#DC2626", color: "#fff", border: "none",
            borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap"
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/>
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <MetricCard
          label="Total pedidos"
          value={filtered.length}
          sub={filtered.length !== orders.length ? `de ${orders.length} totales` : null}
        />
        <MetricCard label="Monto total" value={`Q ${totalQ.toLocaleString("es-GT", { minimumFractionDigits: 2 })}`} />
        {chartData.map(d => <MetricCard key={d.name} label={d.name} value={d.count} />)}
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#374151" }}>📋 PEDIDOS POR ESTADO</p>
          <span style={{ fontSize: 12, color: "#6B7280" }}>{sorted.length} resultado{sorted.length !== 1 ? "s" : ""}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...th("id"), width: 140 }} onClick={() => handleSort("id")}># Orden<Arrow col="id" /></th>
                <th style={th("client")} onClick={() => handleSort("client")}>Cliente<Arrow col="client" /></th>
                <th style={{ ...th("status"), width: 140 }}>Estado</th>
                <th style={{ ...th("payment"), width: 160 }}>Método de Pago</th>
                <th style={{ ...th("total", true), width: 120 }} onClick={() => handleSort("total")}>Total<Arrow col="total" /></th>
                <th style={{ ...th("created_at"), width: 110 }} onClick={() => handleSort("created_at")}>Fecha<Arrow col="created_at" /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0
                ? <tr><td colSpan={6} style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Sin datos.</td></tr>
                : sorted.map((o, i) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #F3F4F6", background: i % 2 ? "#FAFAFA" : "#fff" }}>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", fontSize: 12, color: "#6B7280" }}>
                      {getId(o)}
                    </td>
                    <td style={{ padding: "11px 14px", fontWeight: 500 }}>{getClient(o)}</td>
                    <td style={{ padding: "11px 14px" }}><Badge name={getStatus(o)} /></td>
                    <td style={{ padding: "11px 14px", color: "#6B7280" }}>{getPayment(o)}</td>
                    <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 600 }}>
                      Q {getTotal(o).toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "11px 14px", color: "#6B7280", whiteSpace: "nowrap" }}>
                      {o.created_at ? toGuatemala(o.created_at).toLocaleDateString("es-GT") : "—"}
                    </td>
                  </tr>
                ))
              }
            </tbody>
            {sorted.length > 0 && (
              <tfoot>
                <tr style={{ background: "#F9FAFB", borderTop: "2px solid #E5E7EB" }}>
                  <td colSpan={4} style={{ padding: "11px 14px", fontWeight: 700, fontSize: 12, color: "#374151", textTransform: "uppercase" }}>Total</td>
                  <td style={{ padding: "11px 14px", textAlign: "right", fontWeight: 700 }}>
                    Q {totalQ.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
