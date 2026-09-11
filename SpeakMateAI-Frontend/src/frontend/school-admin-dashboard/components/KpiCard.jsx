import { motion } from "framer-motion";
import { Users, School, ClipboardList, BarChart3, Mic, Award, Activity, ArrowUpRight, ArrowDownRight, UserCheck } from "lucide-react";

const ICONS = {
    users: Users,
    school: School,
    clipboard: ClipboardList,
    chart: BarChart3,
    mic: Mic,
    award: Award,
    activity: Activity,
    "user-check": UserCheck,
    usercheck: UserCheck,
};

function resolveIcon(name) {
    if (!name) return Users;
    const key = String(name).toLowerCase().replace(/[-_\s]/g, "");
    if (ICONS[String(name).toLowerCase()]) return ICONS[String(name).toLowerCase()];
    if (ICONS[key]) return ICONS[key];
    if (key.includes("school")) return School;
    if (key.includes("chart")) return BarChart3;
    if (key.includes("award")) return Award;
    if (key.includes("clip")) return ClipboardList;
    return Users;
}

function Sparkline({ data, color }) {
    const safeColor = typeof color === "string" ? color : "#6c63ff";
    const series = Array.isArray(data) ? data.filter((n) => typeof n === "number" && !Number.isNaN(n)) : [];
    if (series.length < 2) return null;

    const w = 64;
    const h = 22;
    const pad = 2;

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
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible opacity-80" aria-hidden="true">
            <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={safeColor} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={safeColor} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={areaPath} fill={`url(#${gid})`} />
            <path d={linePath} fill="none" stroke={safeColor} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function KpiCard({ kpi, index = 0 }) {
    const label = kpi?.label || kpi?.title || "Metric";
    const iconName = kpi?.icon || kpi?.iconName || "users";
    const accent = kpi?.accent || "#6c63ff";
    const trend = kpi?.trend || "up";
    const prefix = kpi?.prefix || "";
    const isUp = trend === "up";
    const TrendIcon = isUp ? ArrowUpRight : ArrowDownRight;

    const Icon = resolveIcon(iconName);

    const rawVal = kpi?.value;
    const isNumeric = typeof rawVal === "number" || (!isNaN(Number(rawVal)) && rawVal !== "" && rawVal !== null && rawVal !== undefined);
    const formattedValue = isNumeric
        ? `${prefix}${Number(rawVal).toLocaleString("en-US")}`
        : String(rawVal ?? "0");

    const hasNumericChange = typeof kpi?.change === "number" && !isNaN(kpi?.change);
    const changeVal = hasNumericChange ? Math.abs(kpi.change) : null;

    let subtitleText = kpi?.subtitle;
    if (!subtitleText && typeof kpi?.change === "string" && kpi.change.trim()) {
        subtitleText = kpi.change;
    } else if (!subtitleText && hasNumericChange && changeVal > 0) {
        subtitleText = "vs. last month";
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
            whileHover={{ y: -2 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 shadow-sm transition-all hover:border-[var(--border-hover,#cbd5e1)] hover:shadow-md"
        >
            <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    {label}
                </span>
                <div
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-105 sm:h-8 sm:w-8"
                    style={{ background: `${accent}15`, color: accent }}
                >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.2} />
                </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between gap-2">
                <h3 className="min-w-0 truncate text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {formattedValue}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                    {kpi?.sparkline && <Sparkline data={kpi.sparkline} color={accent} />}
                    {hasNumericChange && changeVal > 0 && (
                        <span
                            className={[
                                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                isUp
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                            ].join(" ")}
                        >
                            <TrendIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                            {changeVal}%
                        </span>
                    )}
                </div>
            </div>

            {subtitleText && (
                <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">
                    {subtitleText}
                </p>
            )}
        </motion.div>
    );
}

export default KpiCard;
