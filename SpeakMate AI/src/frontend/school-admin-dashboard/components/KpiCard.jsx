import { motion } from "framer-motion";
import { Users, School, ClipboardList, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

const ICONS = {
    users: Users,
    school: School,
    clipboard: ClipboardList,
    chart: BarChart3,
};

function resolveIcon(name) {
    if (!name) return Users;
    const key = String(name).toLowerCase();
    return ICONS[key] || Users;
}

function Sparkline({ data, color }) {
    const safeColor = typeof color === "string" ? color : "#6c63ff";
    const series = Array.isArray(data) ? data.filter((n) => typeof n === "number" && !Number.isNaN(n)) : [];
    const w = 96;
    const h = 32;
    const pad = 2;
    if (series.length < 2) {
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden="true" />
        );
    }
    const min = Math.min(...series);
    const max = Math.max(...series);
    const range = max - min || 1;
    const step = (w - pad * 2) / (series.length - 1);
    const points = series.map((v, i) => {
        const x = pad + i * step;
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        return [x, y];
    });
    const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
    const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`;
    const gid = `spark-${safeColor.replace("#", "")}`;
    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={safeColor} stopOpacity="0.28" />
                    <stop offset="100%" stopColor={safeColor} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gid})`} />
            <path d={linePath} fill="none" stroke={safeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function KpiCard({ kpi, index = 0 }) {
    const safeKpi = {
        icon: "users",
        accent: "#6c63ff",
        trend: "up",
        change: 0,
        prefix: "",
        ...kpi,
    };

    const Icon = resolveIcon(safeKpi.icon);
    const isUp = safeKpi.trend === "up";
    const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;
    const formattedValue = typeof safeKpi.value === "string" 
        ? `${safeKpi.prefix}${safeKpi.value}`
        : `${safeKpi.prefix}${(safeKpi.value || 0).toLocaleString("en-US")}`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)] sm:p-5"
        >
            <div
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-[0.10] blur-2xl transition-opacity group-hover:opacity-20"
                style={{ background: safeKpi.accent }}
            />
            <div className="flex items-start justify-between gap-2">
                <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-11 sm:w-11"
                    style={{ background: `${safeKpi.accent}1a`, color: safeKpi.accent }}
                >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <div className="hidden sm:block">
                    <Sparkline data={safeKpi.sparkline} color={safeKpi.accent} />
                </div>
            </div>
            <div className="mt-4 flex-1">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {safeKpi.label}
                </p>
                <div className="mt-1 flex items-end justify-between gap-2">
                    <h3 className="min-w-0 truncate text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                        {formattedValue}
                    </h3>
                    {safeKpi.change !== undefined && (
                        <span
                            className={[
                                "inline-flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
                                isUp
                                    ? "bg-emerald-500/10 text-emerald-500"
                                    : "bg-rose-500/10 text-rose-500",
                            ].join(" ")}
                        >
                            <TrendIcon className="h-3 w-3" />
                            {Math.abs(safeKpi.change)}%
                        </span>
                    )}
                </div>
                {safeKpi.subtitle && (
                    <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{safeKpi.subtitle}</p>
                )}
            </div>
        </motion.div>
    );
}

export default KpiCard;
