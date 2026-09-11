import { motion } from "framer-motion";
import {
    Users,
    Activity,
    UserPlus,
    UserX,
    UserCheck,
    School,
    Building,
    Building2,
    MessageSquare,
    Mic,
    DollarSign,
    TrendingUp,
    IndianRupee,
    ArrowUpRight,
    ArrowDownRight,
    GraduationCap,
    BookOpen,
} from "lucide-react";

/**
 * admin-dashboard/components/KpiCard.jsx
 *
 * Compact, modern SaaS KPI tile:
 *  - High information density, reduced vertical height
 *  - Top bar: Uppercase metric label + subtle accent icon chip
 *  - Value: Bold metric value with optional trend percentage badge / growth badge
 *  - Subtitle: Clear description or comparison text
 *  - Pattern A: Interactive status breakdown micro-pills (Active vs Inactive)
 *  - Optional sparkline support without taking extra space when absent
 */

const ICONS = {
    users: Users,
    activity: Activity,
    "user-plus": UserPlus,
    userplus: UserPlus,
    "user-x": UserX,
    userx: UserX,
    "user-check": UserCheck,
    usercheck: UserCheck,
    school: School,
    building: Building,
    building2: Building2,
    message: MessageSquare,
    mic: Mic,
    dollar: DollarSign,
    trending: TrendingUp,
    rupee: IndianRupee,
    "graduation-cap": GraduationCap,
    graduationcap: GraduationCap,
    student: GraduationCap,
    students: GraduationCap,
    "book-open": BookOpen,
    bookopen: BookOpen,
    teacher: BookOpen,
    teachers: BookOpen,
};

function resolveIcon(name) {
    if (!name) return Users;
    const lower = String(name).toLowerCase();
    const clean = lower.replace(/[-_\s]/g, "");
    if (ICONS[lower]) return ICONS[lower];
    if (ICONS[clean]) return ICONS[clean];
    if (clean.includes("student") || clean.includes("graduat")) return GraduationCap;
    if (clean.includes("teacher") || clean.includes("book")) return BookOpen;
    if (clean.includes("school") || clean.includes("building")) return Building;
    if (clean.includes("check")) return UserCheck;
    if (clean.includes("plus")) return UserPlus;
    if (clean.includes("x")) return UserX;
    if (clean.includes("activity")) return Activity;
    if (clean.includes("rupee") || clean.includes("indian")) return IndianRupee;
    if (clean.includes("trend")) return TrendingUp;
    return Users;
}

function Sparkline({ data, color }) {
    const safeColor = typeof color === "string" ? color : "#6366f1";
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

export function KpiCard({ kpi, index = 0, onClick }) {
    const handleClick = onClick || kpi?.onClick;
    const isInteractive = typeof handleClick === "function";
    const label = kpi?.label || kpi?.title || "Metric";
    const iconName = kpi?.icon || kpi?.iconName || "users";
    const accent = kpi?.accent || "#6366f1";
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

    // Only render numeric trend percentages (never NaN%)
    const hasNumericChange = typeof kpi?.change === "number" && !isNaN(kpi?.change);
    const changeVal = hasNumericChange ? Math.abs(kpi.change) : null;

    // Subtitle logic
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
            whileHover={{ y: isInteractive ? -3 : -2 }}
            onClick={handleClick}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
            onKeyDown={isInteractive ? (e) => (e.key === "Enter" || e.key === " ") && handleClick(e) : undefined}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3.5 shadow-sm transition-all ${
                isInteractive ? "cursor-pointer hover:border-[var(--color-primary)]/60 hover:shadow-md active:scale-[0.99]" : "hover:border-[var(--border-hover,#cbd5e1)] hover:shadow-md"
            }`}
        >
            {/* Top row: Label & Icon */}
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

            {/* Middle: Big Value + Growth Badge / Trend / Sparkline */}
            <div className="mt-2 flex items-baseline justify-between gap-2">
                <h3 className="min-w-0 truncate text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                    {formattedValue}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                    {kpi?.growthBadge && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {kpi.growthBadge}
                        </span>
                    )}
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

            {/* Subtitle */}
            {subtitleText && (
                <p className="mt-1 truncate text-[11px] text-[var(--text-muted)]">
                    {subtitleText}
                </p>
            )}

            {/* Pattern A: Status Breakdown Micro-Pills */}
            {kpi?.statusBreakdown && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--border-subtle)] pt-2.5">
                    {/* Active Pill */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof kpi.statusBreakdown.onActiveClick === "function") {
                                kpi.statusBreakdown.onActiveClick(e);
                            }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] dark:text-emerald-400 cursor-pointer"
                        title={`Filter ${label} by Active status`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{Number(kpi.statusBreakdown.active ?? 0).toLocaleString()} {kpi.statusBreakdown.activeLabel || "Active"}</span>
                    </button>

                    {/* Inactive Pill */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (typeof kpi.statusBreakdown.onInactiveClick === "function") {
                                kpi.statusBreakdown.onInactiveClick(e);
                            }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 transition-all hover:bg-amber-500/20 hover:scale-[1.02] active:scale-[0.98] dark:text-amber-400 cursor-pointer"
                        title={`Filter ${label} by Inactive status`}
                    >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>{Number(kpi.statusBreakdown.inactive ?? 0).toLocaleString()} {kpi.statusBreakdown.inactiveLabel || "Inactive"}</span>
                    </button>
                </div>
            )}
        </motion.div>
    );
}

export default KpiCard;
