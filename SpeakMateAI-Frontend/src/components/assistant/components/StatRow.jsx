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

    return (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2">
            {stats.slice(0, 4).map((stat, index) => {
                const delta = isPositiveDelta(stat.delta);
                const DeltaIcon = delta === true ? TrendingUp : delta === false ? TrendingDown : null;
                const deltaClass =
                    delta === true
                        ? "text-emerald-500"
                        : delta === false
                            ? "text-red-500"
                            : "text-[var(--text-muted)]";

                return (
                    <div
                        key={`${stat.label}-${index}`}
                        className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2.5 shadow-sm"
                    >
                        <p className="truncate text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
                            {stat.label}
                        </p>
                        <div className="mt-1 flex items-baseline gap-1.5">
                            <p className="text-base font-bold text-[var(--text-primary)]">
                                {stat.value}
                            </p>
                            {DeltaIcon && stat.delta ? (
                                <span
                                    className={`inline-flex items-center gap-0.5 text-xs font-semibold ${deltaClass}`}
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
