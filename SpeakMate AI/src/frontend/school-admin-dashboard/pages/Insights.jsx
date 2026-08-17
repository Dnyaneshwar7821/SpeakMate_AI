import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Activity, Volume2, TrendingUp, Award, CalendarDays, PlayCircle } from "lucide-react";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    BarChart, Bar, Cell
} from 'recharts';

import Button from "@components/common/Button";
import SectionCard from "@school-admin/components/SectionCard";
import KpiCard from "@school-admin/components/KpiCard";
import { getInitials } from "@utils/formatters";

// Mock Data
const MOCK_DATA = {
    "1m": {
        fluencyTrendData: [
            { month: 'W1', fluency: 82, pronunciation: 80 },
            { month: 'W2', fluency: 83, pronunciation: 81 },
            { month: 'W3', fluency: 84, pronunciation: 82 },
            { month: 'W4', fluency: 85, pronunciation: 83 },
        ],
        kpiValues: [
            { value: "85%", change: 1.2, sparkline: [82, 83, 83, 84, 85] },
            { value: "83%", change: 0.5, sparkline: [80, 81, 81, 82, 83] },
            { value: "210 hrs", change: 5.4, sparkline: [40, 45, 50, 60, 65] }
        ]
    },
    "3m": {
        fluencyTrendData: [
            { month: 'Apr', fluency: 75, pronunciation: 73 },
            { month: 'May', fluency: 82, pronunciation: 78 },
            { month: 'Jun', fluency: 85, pronunciation: 83 },
        ],
        kpiValues: [
            { value: "81%", change: 2.5, sparkline: [75, 78, 80, 82, 81] },
            { value: "79%", change: 3.1, sparkline: [70, 73, 76, 78, 79] },
            { value: "620 hrs", change: 8.2, sparkline: [120, 150, 180, 200, 210] }
        ]
    },
    "6m": {
        fluencyTrendData: [
            { month: 'Jan', fluency: 65, pronunciation: 62 },
            { month: 'Feb', fluency: 68, pronunciation: 65 },
            { month: 'Mar', fluency: 72, pronunciation: 70 },
            { month: 'Apr', fluency: 75, pronunciation: 73 },
            { month: 'May', fluency: 82, pronunciation: 78 },
            { month: 'Jun', fluency: 85, pronunciation: 83 },
        ],
        kpiValues: [
            { value: "85%", change: 3.2, sparkline: [75, 78, 80, 82, 83, 84, 85, 84, 85, 85] },
            { value: "83%", change: 5.1, sparkline: [60, 65, 70, 72, 75, 78, 80, 81, 82, 83] },
            { value: "1,240 hrs", change: 12.5, sparkline: [100, 110, 115, 120, 125, 130, 135, 140, 150, 160] }
        ]
    },
    "1y": {
        fluencyTrendData: [
            { month: 'Jul', fluency: 50, pronunciation: 48 },
            { month: 'Aug', fluency: 52, pronunciation: 50 },
            { month: 'Sep', fluency: 55, pronunciation: 54 },
            { month: 'Oct', fluency: 58, pronunciation: 56 },
            { month: 'Nov', fluency: 60, pronunciation: 59 },
            { month: 'Dec', fluency: 62, pronunciation: 60 },
            { month: 'Jan', fluency: 65, pronunciation: 62 },
            { month: 'Feb', fluency: 68, pronunciation: 65 },
            { month: 'Mar', fluency: 72, pronunciation: 70 },
            { month: 'Apr', fluency: 75, pronunciation: 73 },
            { month: 'May', fluency: 82, pronunciation: 78 },
            { month: 'Jun', fluency: 85, pronunciation: 83 },
        ],
        kpiValues: [
            { value: "78%", change: 15.2, sparkline: [50, 52, 55, 60, 65, 70, 75, 80, 82, 85] },
            { value: "75%", change: 18.1, sparkline: [48, 50, 54, 59, 62, 65, 70, 73, 78, 83] },
            { value: "2,450 hrs", change: 25.5, sparkline: [50, 60, 70, 80, 90, 100, 110, 120, 130, 150] }
        ]
    }
};

const speechMetricsData = [
    { metric: 'Fluency', score: 85 },
    { metric: 'Pronunciation', score: 83 },
    { metric: 'Vocabulary', score: 78 },
    { metric: 'Grammar', score: 72 },
    { metric: 'Confidence', score: 80 },
];

const mispronouncedWordsData = [
    { word: 'Entrepreneur', count: 145, difficulty: 'High' },
    { word: 'Specifically', count: 120, difficulty: 'Medium' },
    { word: 'Worcestershire', count: 98, difficulty: 'High' },
    { word: 'Pronunciation', count: 85, difficulty: 'Medium' },
    { word: 'Mischievous', count: 72, difficulty: 'Medium' },
];

const topSpeakers = [
    { id: 1, name: "Priya Sharma", score: 98, standard: 10, avatar: "bg-amber-500" },
    { id: 2, name: "Rahul Verma", score: 96, standard: 9, avatar: "bg-slate-400" },
    { id: 3, name: "Anita Desai", score: 95, standard: 10, avatar: "bg-amber-700" },
    { id: 4, name: "Vikram Singh", score: 92, standard: 8, avatar: "bg-indigo-500" },
    { id: 5, name: "Neha Gupta", score: 90, standard: 9, avatar: "bg-purple-500" },
];

export function Insights() {
    const [timeRange, setTimeRange] = useState("6m");
    const [playingWord, setPlayingWord] = useState(null);

    const handlePlayWord = (word) => {
        setPlayingWord(word);
        setTimeout(() => setPlayingWord(null), 1500); // Simulate audio playing
    };

    const currentData = MOCK_DATA[timeRange] || MOCK_DATA["6m"];
    const { fluencyTrendData, kpiValues } = currentData;

    const kpis = [
        { id: "avg-fluency", label: "Avg Fluency Score", value: kpiValues[0].value, change: kpiValues[0].change, trend: "up", icon: "mic", accent: "#6c63ff", sparkline: kpiValues[0].sparkline },
        { id: "avg-pronunciation", label: "Pronunciation Accuracy", value: kpiValues[1].value, change: kpiValues[1].change, trend: "up", icon: "award", accent: "#22c55e", sparkline: kpiValues[1].sparkline },
        { id: "active-speaking", label: "Active Speaking Time", value: kpiValues[2].value, change: kpiValues[2].change, trend: "up", icon: "activity", accent: "#ff6584", sparkline: kpiValues[2].sparkline },
    ];

    return (
        <div className="space-y-5 sm:space-y-6">
            
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
                        <ResponsiveContainer width="100%" height="100%">
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
                        </ResponsiveContainer>
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
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={fluencyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorFluency" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPronun" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                                />
                                <Area type="monotone" dataKey="fluency" name="Fluency" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorFluency)" activeDot={{ r: 6, strokeWidth: 0 }} />
                                <Area type="monotone" dataKey="pronunciation" name="Pronunciation" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPronun)" activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
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
                        {mispronouncedWordsData.map((item, idx) => (
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
                                    <button 
                                        onClick={() => handlePlayWord(item.word)}
                                        className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${playingWord === item.word ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(108,99,255,0.5)]' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--color-primary)] border border-[var(--border-subtle)]'}`}
                                        aria-label={`Play pronunciation of ${item.word}`}
                                    >
                                        {playingWord === item.word ? (
                                            <Volume2 className="h-4 w-4 animate-pulse" />
                                        ) : (
                                            <PlayCircle className="h-4 w-4" />
                                        )}
                                    </button>
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
                        {topSpeakers.map((student, index) => (
                            <div key={student.id} className="group flex items-center justify-between border-b border-[var(--border-subtle)] p-4 last:border-0 hover:bg-[var(--bg-hover)] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold text-white transition-transform group-hover:scale-110 ${student.avatar} shadow-md`}>
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
