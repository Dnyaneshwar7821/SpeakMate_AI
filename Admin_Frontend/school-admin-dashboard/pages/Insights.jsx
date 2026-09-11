import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";

import SectionCard from "@school-admin/components/SectionCard";
import KpiCard from "@school-admin/components/KpiCard";
import { schoolAdminDataApi } from "../../src/services/schoolAdminDataApi";
import { getInitials } from "@utils/formatters";

const RANGES = ["1m", "3m", "6m", "1y"];
const AVATAR_COLORS = ["bg-amber-500", "bg-slate-400", "bg-amber-700", "bg-indigo-500", "bg-purple-500"];

function formatPercent(value) {
    return `${Number(value || 0).toFixed(1)}%`;
}

function formatHours(seconds) {
    return `${(Number(seconds || 0) / 3600).toFixed(1)} hrs`;
}

function EmptyState({ children }) {
    return <div className="flex min-h-24 items-center justify-center px-5 py-8 text-center text-sm text-[var(--text-muted)]">{children}</div>;
}


export function Insights() {
    const [timeRange, setTimeRange] = useState("6m");
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        schoolAdminDataApi.getInsights(timeRange)
            .then((data) => active && setInsights(data))
            .catch(() => active && setError("Unable to load speaking insights."))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [timeRange]);

    const kpis = [
        { id: "avg-fluency", label: "Avg Fluency Score", value: formatPercent(insights?.fluency?.value), change: insights?.fluency?.change || 0, trend: "up", icon: "mic", accent: "#6c63ff", sparkline: insights?.fluency?.sparkline },
        { id: "avg-pronunciation", label: "Pronunciation Accuracy", value: formatPercent(insights?.pronunciation?.value), change: insights?.pronunciation?.change || 0, trend: "up", icon: "award", accent: "#22c55e", sparkline: insights?.pronunciation?.sparkline },
        { id: "active-speaking", label: "Active Speaking Time", value: formatHours(insights?.speakingTime?.seconds), change: insights?.speakingTime?.change || 0, trend: "up", icon: "activity", accent: "#ff6584", sparkline: insights?.speakingTime?.sparkline },
    ];
    const speechMetricsData = insights?.speechMetrics || [];
    const fluencyTrendData = insights?.trends || [];
    const mispronouncedWordsData = insights?.mispronouncedWords || [];
    const topSpeakers = insights?.topSpeakers || [];

    return (
        <div className="space-y-5 sm:space-y-6">
            {loading && <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)]">Loading speaking insights...</div>}
            {error && <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{error}</div>}

            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#6c63ff]/10 text-[#6c63ff]">
                        <Mic className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            AI Speech Insights
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Deep analytics on student spoken language performance
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg bg-[var(--bg-elevated)] p-1 border border-[var(--border-subtle)]">
                    {["1m", "3m", "6m", "1y"].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${timeRange === range ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {kpis.map((kpi, i) => (
                    <KpiCard key={kpi.id} kpi={kpi} index={i} />
                ))}
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

                {/* Speech Metrics Radar */}
                <SectionCard
                    title="Average Speech Metrics"
                    subtitle="School-wide performance breakdown"
                    className="lg:col-span-1"
                    delay={0.1}
                >
                    <div className="h-[280px] w-full">
                        {speechMetricsData.length === 0 ? (
                            <EmptyState>No speaking metric data is available for this period.</EmptyState>
                        ) : <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={speechMetricsData}>
                                <PolarGrid stroke="var(--border-default)" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="score" stroke="#6c63ff" strokeWidth={2} fill="#6c63ff" fillOpacity={0.4} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                                    itemStyle={{ color: '#6c63ff', fontWeight: 'bold' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>}
                    </div>
                </SectionCard>

                {/* Fluency Trends */}
                <SectionCard
                    title="Fluency & Pronunciation Trends"
                    subtitle="Historical performance over time"
                    className="lg:col-span-2"
                    delay={0.15}
                    action={
                        <div className="flex items-center gap-4 text-xs font-semibold">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[var(--color-primary)]"></span>
                                <span className="text-[var(--text-secondary)]">Fluency</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-[#22c55e]"></span>
                                <span className="text-[var(--text-secondary)]">Pronunciation</span>
                            </div>
                        </div>
                    }
                >
                    <div className="h-[280px] w-full">
                        {fluencyTrendData.length === 0 ? (
                            <EmptyState>No trend data is available for this period.</EmptyState>
                        ) : <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fluencyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorFluency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPronun" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Area type="monotone" dataKey="fluency" name="Fluency" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorFluency)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="pronunciation" name="Pronunciation" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPronun)" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>}
                    </div>
                </SectionCard>

            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                {/* Commonly Mispronounced Words */}
                <SectionCard
                    title="Commonly Mispronounced Words"
                    subtitle="Words students struggle with the most"
                    delay={0.2}
                    bodyClassName="p-0"
                >
                    <div className="flex flex-col">
                        {mispronouncedWordsData.length === 0 ? (
                            <EmptyState>Word-level pronunciation records are not available from persisted data.</EmptyState>
                        ) : mispronouncedWordsData.map((item, idx) => (
                            <div key={item.word} className="flex items-center justify-between border-b border-[var(--border-subtle)] p-4 last:border-0 hover:bg-[var(--bg-hover)] transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-elevated)] text-sm font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-[var(--text-primary)]">{item.word}</h4>
                                        <p className="text-xs font-medium text-[var(--text-muted)] mt-0.5">{item.count} mispronunciations</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${item.difficulty === 'High' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {item.difficulty}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Top Speakers */}
                <SectionCard
                    title="Top Speakers Leaderboard"
                    subtitle="Students with highest pronunciation accuracy"
                    delay={0.25}
                    bodyClassName="p-0"
                >
                    <div className="flex flex-col">
                        {topSpeakers.length === 0 ? (
                            <EmptyState>No speaking sessions are available for this period.</EmptyState>
                        ) : topSpeakers.map((student, index) => (
                            <div key={student.id} className="group flex items-center justify-between border-b border-[var(--border-subtle)] p-4 last:border-0 hover:bg-[var(--bg-hover)] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white transition-transform group-hover:scale-110 ${AVATAR_COLORS[index % AVATAR_COLORS.length]} shadow-md`}>
                                            {getInitials(student.name)}
                                        </span>
                                        {index < 3 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[10px]">
                                                {index === 0 ? '🏆' : index + 1}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{student.name}</p>
                                        <p className="truncate text-xs font-medium text-[var(--text-secondary)]">Class {student.standard}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-emerald-500">{student.score}%</p>
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Accuracy</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>

            </div>

        </div>
    );
}

export default Insights;
