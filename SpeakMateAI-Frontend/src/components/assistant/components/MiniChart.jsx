import React, { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const PALETTE = [
    "var(--color-primary, #6C63FF)",
    "#06b6d4",
    "#34d399",
    "#fbbf24",
    "#a78bfa",
    "#f87171",
];

function buildSeries(labels, datasets) {
    if (!Array.isArray(datasets) || datasets.length === 0) return [];
    return datasets.map((dataset) => ({
        label: dataset.label || "Value",
        data: (Array.isArray(dataset.data) ? dataset.data : []).map((value) => Number(value) || 0),
    }));
}

function formatAxis(value) {
    if (typeof value !== "string") return value;
    return value.length > 10 ? `${value.slice(0, 9)}…` : value;
}

export function MiniChart({ chart }) {
    const { type, title, labels = [], datasets = [] } = chart || {};

    const series = useMemo(() => buildSeries(labels, datasets), [labels, datasets]);
    const chartData = useMemo(
        () => labels.map((label, index) => ({ name: label, ...series.reduce((acc, s) => ({ ...acc, [s.label]: s.data[index] ?? 0 }), {}) })),
        [labels, series]
    );

    if (!chart || !type || series.length === 0) return null;

    const tooltipStyle = {
        borderRadius: "0.75rem",
        border: "1px solid var(--border-default, #e2e8f0)",
        background: "var(--bg-surface, #ffffff)",
        color: "var(--text-primary, #0f172a)",
        fontSize: "12px",
    };

    return (
        <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-sm">
            {title ? (
                <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{title}</p>
            ) : null}
            <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {type === "line" ? (
                        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} tickFormatter={formatAxis} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                            <Tooltip contentStyle={tooltipStyle} />
                            {series.map((s, index) => (
                                <Line
                                    key={s.label}
                                    type="monotone"
                                    dataKey={s.label}
                                    stroke={PALETTE[index % PALETTE.length]}
                                    strokeWidth={2}
                                    dot={{ r: 2, fill: PALETTE[index % PALETTE.length] }}
                                />
                            ))}
                        </LineChart>
                    ) : type === "pie" ? (
                        <PieChart>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Pie
                                data={chartData}
                                dataKey={series[0]?.label}
                                nameKey="name"
                                innerRadius="45%"
                                outerRadius="80%"
                                paddingAngle={2}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : (
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} tickFormatter={formatAxis} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                            <Tooltip contentStyle={tooltipStyle} />
                            {series.map((s, index) => (
                                <Bar key={s.label} dataKey={s.label} fill={PALETTE[index % PALETTE.length]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default MiniChart;
