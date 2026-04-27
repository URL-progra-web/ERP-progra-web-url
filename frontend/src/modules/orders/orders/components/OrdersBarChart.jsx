import React, { useRef, useEffect, useCallback } from 'react';

/**
 * STATUS_COLORS — paleta fija por nombre de estado.
 * Se asigna dinámicamente a los estados que no estén en la tabla.
 */
const STATUS_PALETTE = [
    '#6366f1', // indigo
    '#f59e0b', // amber
    '#10b981', // emerald
    '#ef4444', // red
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
];

const NAMED_COLORS = {
    SOLICITADO:  '#f59e0b',
    CONFIRMADO:  '#6366f1',
    ENVIADO:     '#3b82f6',
    ENTREGADO:   '#10b981',
    CANCELADO:   '#ef4444',
    BORRADOR:    '#94a3b8',
};

function getStatusColor(name, index) {
    return NAMED_COLORS[name.toUpperCase()] ?? STATUS_PALETTE[index % STATUS_PALETTE.length];
}

const PADDING = { top: 28, right: 20, bottom: 44, left: 48 };
const BAR_GAP = 3;     // gap between bars inside a group
const GROUP_GAP = 12;  // gap between day groups

/**
 * Pure-canvas grouped bar chart.
 *
 * Props:
 *  - series     [{date, STATUS1: n, STATUS2: n, ...}]
 *  - statuses   ['STATUS1', 'STATUS2', ...]
 *  - height     canvas height in px (default 320)
 */
const OrdersBarChart = ({ series = [], statuses = [], height = 320 }) => {
    const canvasRef = useRef(null);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        // Clear
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

        // Max value for Y axis
        const maxVal = Math.max(
            1,
            ...series.flatMap(d => statuses.map(s => d[s] ?? 0))
        );
        const yStep = Math.ceil(maxVal / 5) || 1;
        const yMax  = yStep * 5;

        // Color per status
        const colors = statuses.map((s, i) => getStatusColor(s, i));

        // Geometry
        const n = series.length;
        const barCount = statuses.length;
        const totalBarW = (chartW - GROUP_GAP * (n - 1)) / n;
        const barW = Math.max(4, (totalBarW - BAR_GAP * (barCount - 1)) / barCount);

        // Helpers
        const toY = (v) => PADDING.top + chartH - (v / yMax) * chartH;

        // --- Grid lines & Y labels ---
        ctx.strokeStyle = 'rgba(148,163,184,0.2)';
        ctx.lineWidth = 1;
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const val = (yMax / 5) * i;
            const y = Math.round(toY(val));
            ctx.beginPath();
            ctx.moveTo(PADDING.left, y);
            ctx.lineTo(PADDING.left + chartW, y);
            ctx.stroke();
            ctx.fillText(String(Math.round(val)), PADDING.left - 6, y + 4);
        }

        // --- Bars ---
        series.forEach((dayData, di) => {
            const groupX = PADDING.left + di * (totalBarW + GROUP_GAP);

            statuses.forEach((s, si) => {
                const val = dayData[s] ?? 0;
                const bx = groupX + si * (barW + BAR_GAP);
                const bh = (val / yMax) * chartH;
                const by = PADDING.top + chartH - bh;

                ctx.fillStyle = colors[si];
                // Rounded top corners
                const r = Math.min(3, barW / 2, bh);
                if (bh > 0) {
                    ctx.beginPath();
                    ctx.moveTo(bx + r, by);
                    ctx.lineTo(bx + barW - r, by);
                    ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + r);
                    ctx.lineTo(bx + barW, by + bh);
                    ctx.lineTo(bx, by + bh);
                    ctx.lineTo(bx, by + r);
                    ctx.quadraticCurveTo(bx, by, bx + r, by);
                    ctx.closePath();
                    ctx.fill();
                }

                // Value label on bar
                if (val > 0 && barW > 14) {
                    ctx.fillStyle = '#1e293b';
                    ctx.font = `bold ${Math.min(10, barW - 2)}px system-ui, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillText(String(val), bx + barW / 2, by - 3);
                }
            });

            // X label (date)
            const labelX = groupX + totalBarW / 2;
            const labelY = PADDING.top + chartH + 12;
            
            ctx.save();
            ctx.translate(labelX, labelY);
            ctx.rotate(-Math.PI / 2); // Rotar 90 grados
            ctx.fillStyle = '#64748b';
            ctx.font = '10px system-ui, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(dayData.date.slice(5), 0, 0);
            ctx.restore();
        });
    }, [series, statuses]);

    // Resize observer for responsive width
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
            aria-label="Gráfico de pedidos por estado por día"
            role="img"
        />
    );
};

export default OrdersBarChart;
