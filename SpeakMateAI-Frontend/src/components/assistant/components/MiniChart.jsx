import React, { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
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
    const trimmed = value.trim();
    if (/^school\s*admin/i.test(trimmed)) return "School Adm.";
    if (/^super\s*admin/i.test(trimmed)) return "Super Adm.";
    return trimmed.length > 10 ? `${trimmed.slice(0, 9)}…` : trimmed;
}

export function MiniChart({ chart }) {
    const { type = "bar", title, labels = [], datasets = [] } = chart || {};

    const normalizedType = String(type).toLowerCase().replace(/[_\s]/g, "-");

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

    const isDoughnut = normalizedType === "doughnut" || normalizedType === "donut";
    const isPie = normalizedType === "pie";
    const isHorizontalBar = normalizedType === "horizontal-bar" || normalizedType === "horizontalbar";
    const isLine = normalizedType === "line";

    return (
        <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-sm">
            {title ? (
                <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">{title}</p>
            ) : null}
            <div className={isDoughnut || isPie ? "h-44 w-full" : "h-40 w-full"}>
                <ResponsiveContainer width="100%" height="100%">
                    {isLine ? (
                        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                interval={0}
                                tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 9.5 }}
                                tickFormatter={formatAxis}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} axisLine={false} tickLine={false} width={44} />
                            <Tooltip contentStyle={tooltipStyle} />
                            {series.map((s, index) => (
                                <Line
                                    key={s.label}
                                    type="monotone"
                                    dataKey={s.label}
                                    stroke={PALETTE[index % PALETTE.length]}
                                    strokeWidth={2}
                                    dot={{ r: 2.5, fill: PALETTE[index % PALETTE.length] }}
                                />
                            ))}
                        </LineChart>
                    ) : isDoughnut ? (
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: "10px", paddingTop: "4px", color: "var(--text-secondary, #64748b)" }}
                            />
                            <Pie
                                data={chartData}
                                dataKey={series[0]?.label}
                                nameKey="name"
                                innerRadius="48%"
                                outerRadius="78%"
                                paddingAngle={3}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : isPie ? (
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                wrapperStyle={{ fontSize: "10px", paddingTop: "4px", color: "var(--text-secondary, #64748b)" }}
                            />
                            <Pie
                                data={chartData}
                                dataKey={series[0]?.label}
                                nameKey="name"
                                innerRadius={0}
                                outerRadius="78%"
                                paddingAngle={2}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : isHorizontalBar ? (
                        <BarChart layout="vertical" data={chartData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" horizontal={false} />
                            <XAxis type="number" tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }} tickFormatter={formatAxis} axisLine={false} tickLine={false} width={75} />
                            <Tooltip contentStyle={tooltipStyle} />
                            {series.map((s, index) => (
                                <Bar key={s.label} dataKey={s.label} fill={PALETTE[index % PALETTE.length]} radius={[0, 4, 4, 0]} maxBarSize={20} />
                            ))}
                        </BarChart>
                    ) : (
                        <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                interval={0}
                                tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 9.5 }}
                                tickFormatter={formatAxis}
                                axisLine={false}
                                tickLine={false}
                            />
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
