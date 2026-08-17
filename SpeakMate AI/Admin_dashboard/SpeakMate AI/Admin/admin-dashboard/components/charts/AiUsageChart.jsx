import { motion } from "framer-motion";

/**
 * admin-dashboard/components/charts/AiUsageChart.jsx
 *
 * Dependency-free SVG bar chart with animated grow-in bars,
 * gradient fill, value labels and axis labels.
 *
 * Props:
 *   data: { labels: string[], values: number[] }
 */

export function AiUsageChart({ data }) {
    const W = 720;
    const H = 260;
    const pad = { top: 24, right: 16, bottom: 28, left: 40 };
    const innerW = W - pad.left - pad.right;
    const innerH = H - pad.top - pad.bottom;

    const max = Math.ceil(Math.max(...data.values) / 1000) * 1000;
    const range = max || 1;
    const yTicks = 4;
    const slot = innerW / data.values.length;
    const barW = Math.min(46, slot * 0.55);

    return (
        <div className="w-full">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="block h-auto w-full min-w-0"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="ai-bar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6c63ff" />
                    </linearGradient>
                </defs>

                {/* Grid + Y labels */}
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
                                {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                            </text>
                        </g>
                    );
                })}

                {/* Bars */}
                {data.values.map((v, i) => {
                    const barH = (v / range) * innerH;
                    const x = pad.left + i * slot + (slot - barW) / 2;
                    const y = pad.top + innerH - barH;
                    return (
                        <g key={i}>
                            <motion.rect
                                x={x}
                                width={barW}
                                rx="6"
                                fill="url(#ai-bar)"
                                initial={{ height: 0, y: pad.top + innerH }}
                                animate={{ height: barH, y }}
                                transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                            />
                            <motion.text
                                x={x + barW / 2}
                                y={y - 6}
                                textAnchor="middle"
                                className="fill-[var(--text-secondary)] text-[10px] font-semibold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 + i * 0.06 }}
                            >
                                {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
                            </motion.text>
                            <text
                                x={x + barW / 2}
                                y={H - 8}
                                textAnchor="middle"
                                className="fill-[var(--text-muted)] text-[10px]"
                            >
                                {data.labels[i]}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default AiUsageChart;
