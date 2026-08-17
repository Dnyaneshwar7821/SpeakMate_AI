import { motion } from "framer-motion";

/**
 * admin-dashboard/components/charts/UserGrowthChart.jsx
 *
 * Dependency-free SVG multi-series line chart with gradient fill,
 * animated draw-in, grid lines and axis labels.
 *
 * Props:
 *   data: { labels: string[], series: [{ name, color, values: number[] }] }
 */

export function UserGrowthChart({ data }) {
    const W = 720;
    const H = 260;
    const pad = { top: 20, right: 16, bottom: 28, left: 40 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;

    const allValues = data.series.flatMap((s) => s.values);
    const max = Math.ceil(Math.max(...allValues) / 1000) * 1000;
    const min = 0;
    const range = max - min || 1;

    const xStep = innerW / (data.labels.length - 1);
    const yTicks = 5;

    const toPoint = (v, i) => {
        const x = pad.left + i * xStep;
        const y = pad.top + innerH - ((v - min) / range) * innerH;
        return [x, y];
    };

    return (
        <div className="w-full">
            {/* Legend */}
            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {data.series.map((s) => (
                    <div key={s.name} className="flex min-w-0 items-center gap-2">
                        <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ background: s.color }}
                        />
                        <span className="truncate text-xs font-medium text-[var(--text-secondary)]">
                            {s.name}
                        </span>
                    </div>
                ))}
            </div>

            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="block h-auto w-full min-w-0"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {data.series.map((s) => (
                        <linearGradient key={s.name} id={`ug-${s.name.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.color} stopOpacity="0.22" />
                            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>

                {/* Horizontal grid + Y labels */}
                {Array.from({ length: yTicks + 1 }).map((_, i) => {
                    const y = pad.top + (innerH / yTicks) * i;
                    const val = max - (range / yTicks) * i;
                    return (
                        <g key={i}>
                            <line
                                x1={pad.left}
                                y1={y}
                                x2={W - pad.right}
                                y2={y}
                                stroke="var(--border-subtle)"
                                strokeWidth="1"
                                strokeDasharray="3 4"
                            />
                            <text x={pad.left - 8} y={y + 3} textAnchor="end" className="fill-[var(--text-muted)] text-[10px]">
                                {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                            </text>
                        </g>
                    );
                })}

                {/* X labels */}
                {data.labels.map((label, i) => (
                    <text
                        key={label}
                        x={pad.left + i * xStep}
                        y={H - 8}
                        textAnchor="middle"
                        className="fill-[var(--text-muted)] text-[10px]"
                    >
                        {label}
                    </text>
                ))}

                {/* Series */}
                {data.series.map((s) => {
                    const pts = s.values.map(toPoint);
                    const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
                    const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${pad.top + innerH} L${pts[0][0].toFixed(1)},${pad.top + innerH} Z`;
                    const gid = `ug-${s.name.replace(/\s/g, "")}`;
                    return (
                        <g key={s.name}>
                            <path d={area} fill={`url(#${gid})`} />
                            <motion.path
                                d={line}
                                fill="none"
                                stroke={s.color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, ease: "easeInOut" }}
                            />
                            {pts.map(([x, y], i) => (
                                <motion.circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="var(--bg-surface)"
                                    stroke={s.color}
                                    strokeWidth="2"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6 + i * 0.04 }}
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default UserGrowthChart;
