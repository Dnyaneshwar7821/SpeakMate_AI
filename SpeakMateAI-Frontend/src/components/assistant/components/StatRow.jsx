import React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

/**
 * Renders a row of KPI cards from backend stats: { label, value, delta }.
 */

const isPositiveDelta = (delta) => {
    const cleaned = String(delta ?? "").replace(/,/g, "").trim();
    if (!cleaned) return null;
    const negative = /^-/.test(cleaned) || cleaned.startsWith("-");
    const positive = /^\+/.test(cleaned) || /^-?\d+(\.\d+)?%?$/.test(cleaned);
    if (positive && !negative) return true;
    if (negative) return false;
    return null;
};

export function StatRow({ stats = [] }) {
    if (!Array.isArray(stats) || stats.length === 0) return null;

    const visibleStats = stats;
    const isOdd = visibleStats.length % 2 === 1;

    return (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2">
            {visibleStats.map((stat, index) => {
                const delta = isPositiveDelta(stat.delta);
                const DeltaIcon = delta === true ? TrendingUp : delta === false ? TrendingDown : null;
                const deltaClass =
                    delta === true
                        ? "text-emerald-500"
                        : delta === false
                            ? "text-red-500"
                            : "text-[var(--text-muted)]";

                const isFullWidth = isOdd && index === 0;

                return (
                    <div
                        key={`${stat.label}-${index}`}
                        className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 p-3 shadow-xs transition-all duration-200 hover:border-indigo-500/50 hover:bg-white dark:hover:bg-slate-800 ${
                            isFullWidth ? "col-span-2 sm:col-span-2" : ""
                        }`}
                    >
                        <div className="absolute top-0 right-0 h-10 w-10 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-2xl pointer-events-none" />
                        <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                            {stat.label}
                        </p>
                        <div className="mt-1 flex items-baseline gap-1.5">
                            <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {stat.value}
                            </p>
                            {DeltaIcon && stat.delta ? (
                                <span
                                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${deltaClass}`}
                                >
                                    <DeltaIcon className="h-3 w-3" aria-hidden="true" />
                                    {String(stat.delta).replace(/^[+-]/, "")}
                                </span>
                            ) : null}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default StatRow;
