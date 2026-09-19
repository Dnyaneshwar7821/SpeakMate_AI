import React, { useMemo } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
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
    if (/^school\s*admin/i.test(trimmed)) return "School Admin";
    if (/^super\s*admin/i.test(trimmed)) return "Super Admin";
    return trimmed.length > 12 ? `${trimmed.slice(0, 11)}…` : trimmed;
}

function formatTickLines(value) {
    if (typeof value !== "string") return [String(value ?? "")];
    const trimmed = value.trim();
    if (!trimmed) return [""];

    if (/^school\s*admin/i.test(trimmed)) {
        return ["School", "Admin"];
    }
    if (/^super\s*admin/i.test(trimmed)) {
        return ["Super", "Admin"];
    }

    if (trimmed.includes(" ") && trimmed.length > 7) {
        const words = trimmed.split(/\s+/);
        if (words.length === 2) {
            return words.map((w) => (w.length > 8 ? `${w.slice(0, 7)}…` : w));
        }
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(" ");
        const line2 = words.slice(mid).join(" ");
        return [
            line1.length > 8 ? `${line1.slice(0, 7)}…` : line1,
            line2.length > 8 ? `${line2.slice(0, 7)}…` : line2,
        ];
    }

    return [trimmed.length > 9 ? `${trimmed.slice(0, 8)}…` : trimmed];
}

function CustomXAxisTick(props) {
    const { x, y, payload } = props;
    const lines = formatTickLines(payload?.value);
    return (
        <g transform={`translate(${x},${y})`}>
            <text
                x={0}
                y={0}
                dy={9}
                textAnchor="middle"
                fill="var(--text-muted, #94a3b8)"
                fontSize={9}
                fontWeight={500}
            >
                {lines.map((line, idx) => (
                    <tspan key={idx} x={0} dy={idx === 0 ? 0 : 11}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
}

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
    if (!percent || percent < 0.08) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text
            x={x}
            y={y}
            fill="#ffffff"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
        >
            {`${Math.round(percent * 100)}%`}
        </text>
    );
}

function CustomChartTooltip({ active, payload, label, isPieOrDonut, total }) {
    if (!active || !payload || !payload.length) return null;
    const title = isPieOrDonut ? payload[0]?.name : (label || payload[0]?.name);

    return (
        <div className="rounded-xl border border-[var(--border-default,#e2e8f0)] bg-[var(--bg-surface,#ffffff)] px-2.5 py-1.5 shadow-md">
            <p className="text-[11px] font-semibold text-[var(--text-primary,#0f172a)]">{title}</p>
            <div className="mt-1 space-y-0.5">
                {payload.map((item, idx) => {
                    const value = item.value;
                    const pct = isPieOrDonut && total > 0 ? ((value / total) * 100).toFixed(1) : null;
                    return (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary,#64748b)]">
                            <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color || item.payload?.fill || "var(--color-primary,#6C63FF)" }}
                            />
                            <span>{item.name || item.dataKey}:</span>
                            <strong className="font-semibold text-[var(--text-primary,#0f172a)]">{value}</strong>
                            {pct !== null && (
                                <span className="text-[10px] text-[var(--text-muted,#94a3b8)]">({pct}%)</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function MiniChart({ chart }) {
    const { type = "bar", title, labels = [], datasets = [] } = chart || {};

    const normalizedType = String(type).toLowerCase().replace(/[_\s]/g, "-");

    const series = useMemo(() => buildSeries(labels, datasets), [labels, datasets]);
    const chartData = useMemo(
        () => labels.map((label, index) => ({ name: label, ...series.reduce((acc, s) => ({ ...acc, [s.label]: s.data[index] ?? 0 }), {}) })),
        [labels, series]
    );

    const totalCount = useMemo(() => {
        if (!series.length) return 0;
        return chartData.reduce((sum, item) => {
            const val = Number(item[series[0]?.label]) || 0;
            return sum + val;
        }, 0);
    }, [chartData, series]);

    if (!chart || !type || series.length === 0) return null;

    const isDoughnut = normalizedType === "doughnut" || normalizedType === "donut";
    const isPie = normalizedType === "pie";
    const isHorizontalBar = normalizedType === "horizontal-bar" || normalizedType === "horizontalbar";
    const isLine = normalizedType === "line";

    return (
        <div className="mt-3 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
                {title ? (
                    <p className="text-xs font-semibold text-[var(--text-secondary)]">{title}</p>
                ) : <span />}
                {totalCount > 0 && (
                    <span className="rounded-full bg-[var(--bg-muted,#f1f5f9)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-muted,#64748b)]">
                        Total: {totalCount}
                    </span>
                )}
            </div>
            <div className={isDoughnut || isPie ? "h-52 w-full" : "h-44 w-full"}>
                <ResponsiveContainer width="100%" height="100%">
                    {isLine ? (
                        <LineChart data={chartData} margin={{ top: 12, right: 12, left: -18, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                interval={0}
                                height={34}
                                tick={<CustomXAxisTick />}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={44}
                            />
                            <Tooltip content={<CustomChartTooltip total={totalCount} />} />
                            {series.map((s, index) => (
                                <Line
                                    key={s.label}
                                    type="monotone"
                                    dataKey={s.label}
                                    stroke={PALETTE[index % PALETTE.length]}
                                    strokeWidth={2}
                                    dot={{ r: 3, fill: PALETTE[index % PALETTE.length], strokeWidth: 1.5, stroke: "#fff" }}
                                    activeDot={{ r: 5 }}
                                >
                                    <LabelList
                                        dataKey={s.label}
                                        position="top"
                                        fill="var(--text-secondary, #64748b)"
                                        fontSize={9.5}
                                        fontWeight={600}
                                        offset={6}
                                    />
                                </Line>
                            ))}
                        </LineChart>
                    ) : isDoughnut ? (
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip content={<CustomChartTooltip isPieOrDonut total={totalCount} />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value, entry) => {
                                    const rawVal = entry?.payload?.[series[0]?.label] ?? entry?.payload?.value ?? 0;
                                    const pct = totalCount > 0 ? Math.round((rawVal / totalCount) * 100) : 0;
                                    return (
                                        <span className="text-[10px] text-[var(--text-secondary,#64748b)]">
                                            <span className="font-medium text-[var(--text-primary,#0f172a)]">{value}</span>:{" "}
                                            <span className="font-semibold text-[var(--color-primary,#6C63FF)]">{rawVal}</span>{" "}
                                            <span className="text-[var(--text-muted,#94a3b8)]">({pct}%)</span>
                                        </span>
                                    );
                                }}
                                wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                            />
                            <Pie
                                data={chartData}
                                dataKey={series[0]?.label}
                                nameKey="name"
                                innerRadius="46%"
                                outerRadius="74%"
                                paddingAngle={3}
                                label={renderPieLabel}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                ))}
                            </Pie>
                            <text
                                x="50%"
                                y="40%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-[var(--text-muted,#94a3b8)]"
                                fontSize={10}
                                fontWeight={500}
                            >
                                Total
                            </text>
                            <text
                                x="50%"
                                y="52%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-[var(--text-primary,#0f172a)]"
                                fontSize={14}
                                fontWeight={700}
                            >
                                {totalCount}
                            </text>
                        </PieChart>
                    ) : isPie ? (
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Tooltip content={<CustomChartTooltip isPieOrDonut total={totalCount} />} />
                            <Legend
                                iconType="circle"
                                iconSize={8}
                                formatter={(value, entry) => {
                                    const rawVal = entry?.payload?.[series[0]?.label] ?? entry?.payload?.value ?? 0;
                                    const pct = totalCount > 0 ? Math.round((rawVal / totalCount) * 100) : 0;
                                    return (
                                        <span className="text-[10px] text-[var(--text-secondary,#64748b)]">
                                            <span className="font-medium text-[var(--text-primary,#0f172a)]">{value}</span>:{" "}
                                            <span className="font-semibold text-[var(--color-primary,#6C63FF)]">{rawVal}</span>{" "}
                                            <span className="text-[var(--text-muted,#94a3b8)]">({pct}%)</span>
                                        </span>
                                    );
                                }}
                                wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
                            />
                            <Pie
                                data={chartData}
                                dataKey={series[0]?.label}
                                nameKey="name"
                                innerRadius={0}
                                outerRadius="74%"
                                paddingAngle={2}
                                label={renderPieLabel}
                                labelLine={false}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    ) : isHorizontalBar ? (
                        <BarChart layout="vertical" data={chartData} margin={{ top: 4, right: 28, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" horizontal={false} />
                            <XAxis
                                type="number"
                                allowDecimals={false}
                                tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }}
                                tickFormatter={formatAxis}
                                axisLine={false}
                                tickLine={false}
                                width={80}
                            />
                            <Tooltip content={<CustomChartTooltip total={totalCount} />} />
                            {series.map((s, index) => (
                                <Bar
                                    key={s.label}
                                    dataKey={s.label}
                                    fill={PALETTE[index % PALETTE.length]}
                                    radius={[0, 4, 4, 0]}
                                    maxBarSize={20}
                                >
                                    <LabelList
                                        dataKey={s.label}
                                        position="right"
                                        fill="var(--text-secondary, #64748b)"
                                        fontSize={9.5}
                                        fontWeight={600}
                                        offset={6}
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    ) : (
                        <BarChart data={chartData} margin={{ top: 12, right: 8, left: -18, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default, #e2e8f0)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                interval={0}
                                height={34}
                                tick={<CustomXAxisTick />}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                width={44}
                            />
                            <Tooltip content={<CustomChartTooltip total={totalCount} />} />
                            {series.map((s, index) => (
                                <Bar
                                    key={s.label}
                                    dataKey={s.label}
                                    fill={PALETTE[index % PALETTE.length]}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={22}
                                >
                                    <LabelList
                                        dataKey={s.label}
                                        position="top"
                                        fill="var(--text-secondary, #64748b)"
                                        fontSize={9.5}
                                        fontWeight={600}
                                        offset={4}
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default MiniChart;
