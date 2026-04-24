import React, { useRef, useEffect, useCallback } from 'react';

const STATUS_PALETTE = [
    '#6366f1', '#f59e0b', '#10b981', '#ef4444',
    '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
];
const NAMED_COLORS = {
    SOLICITADO: '#f59e0b',
    CONFIRMADO: '#6366f1',
    ENVIADO:    '#3b82f6',
    ENTREGADO:  '#10b981',
    CANCELADO:  '#ef4444',
    BORRADOR:   '#94a3b8',
};
function getStatusColor(name, index) {
    return NAMED_COLORS[name.toUpperCase()] ?? STATUS_PALETTE[index % STATUS_PALETTE.length];
}

const PADDING = { top: 28, right: 20, bottom: 44, left: 52 };
const DOT_R = 4;

/**
 * Pure-canvas area+line chart for cumulative data.
 *
 * Props:
 *  - series     [{date, STATUS1: n, STATUS2: n, ...}]
 *  - statuses   ['STATUS1', 'STATUS2', ...]
 *  - height     canvas height in px (default 320)
 */
const OrdersLineChart = ({ series = [], statuses = [], height = 320 }) => {
    const canvasRef = useRef(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        if (!series.length || !statuses.length) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '13px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Sin datos para el rango seleccionado', W / 2, H / 2);
            return;
        }

        const chartW = W - PADDING.left - PADDING.right;
        const chartH = H - PADDING.top - PADDING.bottom;
        const n = series.length;

        const maxVal = Math.max(
            1,
            ...series.flatMap(d => statuses.map(s => d[s] ?? 0))
        );
        const yStep = Math.ceil(maxVal / 5) || 1;
        const yMax  = yStep * 5;

        const colors = statuses.map((s, i) => getStatusColor(s, i));

        const xPos = (i) => PADDING.left + (n === 1 ? chartW / 2 : (i / (n - 1)) * chartW);
        const yPos = (v) => PADDING.top + chartH - (v / yMax) * chartH;

        // --- Grid ---
        ctx.font = '11px system-ui, sans-serif';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const val = (yMax / 5) * i;
            const y = Math.round(yPos(val));
            ctx.strokeStyle = 'rgba(148,163,184,0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(PADDING.left, y);
            ctx.lineTo(PADDING.left + chartW, y);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(String(Math.round(val)), PADDING.left - 6, y + 4);
        }

        // Vertical tick lines at each data point
        ctx.strokeStyle = 'rgba(148,163,184,0.07)';
        ctx.lineWidth = 1;
        series.forEach((_, i) => {
            const x = Math.round(xPos(i));
            ctx.beginPath();
            ctx.moveTo(x, PADDING.top);
            ctx.lineTo(x, PADDING.top + chartH);
            ctx.stroke();
        });

        // --- Area + Line per status ---
        statuses.forEach((s, si) => {
            const color = colors[si];
            const points = series.map((d, i) => ({ x: xPos(i), y: yPos(d[s] ?? 0) }));

            // Area fill
            ctx.beginPath();
            ctx.moveTo(points[0].x, PADDING.top + chartH);
            points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.lineTo(points[points.length - 1].x, PADDING.top + chartH);
            ctx.closePath();
            ctx.fillStyle = `${color}22`;
            ctx.fill();

            // Line
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            // Smooth curve with cubic bezier
            for (let i = 1; i < points.length; i++) {
                const cpX = (points[i - 1].x + points[i].x) / 2;
                ctx.bezierCurveTo(cpX, points[i - 1].y, cpX, points[i].y, points[i].x, points[i].y);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.stroke();

            // Dots + value labels
            points.forEach((p, i) => {
                const val = series[i][s] ?? 0;

                // Dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, DOT_R, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.strokeStyle = 'var(--bs-body-bg, #07101f)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Value label (only if enough horizontal space)
                if (chartW / n > 28 && val > 0) {
                    ctx.fillStyle = color;
                    ctx.font = `bold 10px system-ui, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(String(val), p.x, p.y - DOT_R - 4);
                }
            });
        });

        // --- X axis labels ---
        const labelStep = Math.max(1, Math.ceil(n / 20)); // Permitimos más labels al estar en vertical
        series.forEach((d, i) => {
            if (i % labelStep !== 0 && i !== n - 1) return;
            const x = xPos(i);
            const y = PADDING.top + chartH + 12;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 2); // Rotar 90 grados
            ctx.fillStyle = '#64748b';
            ctx.font = '10px system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(d.date.slice(5), 0, 0);
            ctx.restore();
        });
    }, [series, statuses]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const observer = new ResizeObserver(() => {
            canvas.width = canvas.offsetWidth;
            canvas.height = height;
            draw();
        });
        observer.observe(canvas);
        return () => observer.disconnect();
    }, [draw, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = canvas.offsetWidth || 600;
        canvas.height = height;
        draw();
    }, [draw, height]);

    return (
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height, display: 'block' }}
            aria-label="Gráfico de evolución acumulada de pedidos por estado"
            role="img"
        />
    );
};

export default OrdersLineChart;
