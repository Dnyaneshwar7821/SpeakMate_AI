import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, Download, Filter, ChevronDown, CheckCircle2, XCircle, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";

import ResultDetailsModal from "@school-admin/components/ResultDetailsModal";
import SectionCard from "@school-admin/components/SectionCard";
import ResultsTable from "@school-admin/components/ResultsTable";
import { useResults } from "@school-admin/hooks/useSchoolData";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const STANDARD_OPTIONS = ["All Standards", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function Results() {
    const { results, searchTerm, setSearchTerm } = useResults();
    const [selectedStandard, setSelectedStandard] = useState("All Standards");
    const [selectedResult, setSelectedResult] = useState(null);

    // Apply Standard Filter locally in addition to the search filter from useResults hook
    const filteredResults = useMemo(() => {
        if (selectedStandard === "All Standards") return results;
        return results.filter(r => r.standard === selectedStandard);
    }, [results, selectedStandard]);

    // Calculate dynamic KPIs based on the filtered results
    const totalCount = filteredResults.length;
    const avgScore = totalCount > 0 
        ? Math.round(filteredResults.reduce((acc, r) => acc + r.percentage, 0) / totalCount)
        : 0;
    const totalPassed = filteredResults.filter(r => r.status === "Passed").length;
    const totalFailed = totalCount - totalPassed;

    return (
        <div className="space-y-5 sm:space-y-6">
            
            {/* Top Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <BarChart3 className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Results
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {totalCount} results recorded {selectedStandard !== "All Standards" ? `in ${getOrdinal(selectedStandard)} Standard` : 'across all standards'}
                        </p>
                    </div>
                </div>
                
                <Button variant="secondary" className="!h-10 w-full shrink-0 sm:w-auto">
                    <Download className="mr-1.5 h-4 w-4" />
                    Export CSV
                </Button>
            </motion.div>

            {/* Dynamic KPIs Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
                    className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm"
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Average Score</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-[var(--text-primary)]">{avgScore}%</span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm"
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Passed</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-emerald-500">{totalPassed}</span>
                        <span className="text-sm font-medium text-[var(--text-muted)]">/ {totalCount} students</span>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
                    className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm"
                >
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Total Failed</span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-black text-rose-500">{totalFailed}</span>
                        <span className="text-sm font-medium text-[var(--text-muted)]">/ {totalCount} students</span>
                    </div>
                </motion.div>
            </div>

            {/* Table Section */}
            <SectionCard
                title="All Results"
                subtitle="Review student performance across tests"
                delay={0.2}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Filter className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                            <select
                                value={selectedStandard}
                                onChange={(e) => setSelectedStandard(e.target.value === "All Standards" ? "All Standards" : Number(e.target.value))}
                                className="h-11 w-full min-w-[12rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                                aria-label="Filter by standard"
                            >
                                {STANDARD_OPTIONS.map(opt => (
                                    <option key={opt} value={opt}>
                                        {opt === "All Standards" ? opt : `${getOrdinal(opt)} Standard`}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                        </div>

                        <div className="w-full sm:w-auto sm:max-w-[16rem]">
                            <Input
                                placeholder="Search results…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                }
            >
                <ResultsTable results={filteredResults} onRowClick={setSelectedResult} />
            </SectionCard>

            <ResultDetailsModal
                isOpen={Boolean(selectedResult)}
                result={selectedResult}
                onClose={() => setSelectedResult(null)}
            />
        </div>
    );
}

export default Results;
