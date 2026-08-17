import { motion } from "framer-motion";

/**
 * admin-dashboard/components/charts/LearningProgressChart.jsx
 *
 * Dependency-free SVG donut chart showing per-skill learning progress,
 * with an animated center label and a responsive legend list.
 *
 * Responsiveness:
 *   - The donut is rendered with a fixed viewBox and scales fluidly via
 *     `w-full max-w-[...]` so it never overflows its container.
 *   - On narrow widths the legend stacks below the donut in a 2-col grid;
 *     on wider widths it sits beside the donut in a single column.
 *   - Long labels are truncated with `truncate` and a `title` tooltip.
 *
 * Props:
 *   data: [{ label, value, color }]
 */

export function LearningProgressChart({ data }) {
    // Fixed coordinate space — the SVG scales to fit its container.
    const size = 200;
    const stroke = 20;
    const r = (size - stroke) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;

    // Distribute segments proportionally to value (stacked around the ring
    // weighted by their value).
    const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
    let offset = 0;

    const segments = data.map((d) => {
        const fraction = d.value / total;
        const dash = fraction * circumference;
        const seg = { ...d, dash, gap: circumference - dash, offset: -offset };
        offset += dash;
        return seg;
    });

    const avg = Math.round(total / (data.length || 1));

    return (
        <div className="flex w-full flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-center sm:gap-6 lg:justify-between">
            {/* Donut — fluid width, capped so it never dominates the card */}
            <div className="relative aspect-square w-full max-w-[180px] shrink-0 sm:w-auto sm:basis-[180px]">
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${size} ${size}`}
                    className="block -rotate-90"
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label={`Average learning progress ${avg} percent`}
                >
                    {/* Track */}
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke="var(--border-subtle)"
                        strokeWidth={stroke}
                    />
                    {segments.map((s, i) => (
                        <motion.circle
                            key={s.label}
                            cx={cx}
                            cy={cy}
                            r={r}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={`${s.dash} ${s.gap}`}
                            strokeDashoffset={s.offset}
                            initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
                            animate={{ opacity: 1, strokeDasharray: `${s.dash} ${s.gap}` }}
                            transition={{ duration: 0.8, delay: i * 0.12, ease: "easeOut" }}
                        />
                    ))}
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold leading-none text-[var(--text-primary)] sm:text-[26px]">
                        {avg}%
                    </span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Avg
                    </span>
                </div>
            </div>

            {/* Legend — 2 columns on mobile (below donut), 1 column beside on sm+ */}
            <div className="grid w-full grid-cols-2 gap-x-4 gap-y-2.5 sm:grid-cols-1 sm:gap-2">
                {data.map((d) => (
                    <div
                        key={d.label}
                        className="flex min-w-0 items-center justify-between gap-2"
                        title={`${d.label}: ${d.value}%`}
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <span
                                className="h-2.5 w-2.5 shrink-0 rounded-full"
                                style={{ background: d.color }}
                            />
                            <span className="truncate text-xs font-medium text-[var(--text-secondary)]">
                                {d.label}
                            </span>
                        </div>
                        <span className="shrink-0 text-xs font-bold text-[var(--text-primary)]">
                            {d.value}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default LearningProgressChart;
