
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { containerVariants, itemVariants } from "@animations/variants";
import Card from "@components/common/Card";
import Modal from "@components/common/Modal";
import EmptyState from "@/Admin_panel/components/teacher/common/EmptyState";
import { teacherDataApi } from "../../src/services/teacherDataApi";

const toneStyles = {
    indigo: { soft: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300", bar: "bg-indigo-500", border: "border-indigo-100 dark:border-indigo-900/50" },
    emerald: { soft: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", bar: "bg-emerald-500", border: "border-emerald-100 dark:border-emerald-900/50" },
    violet: { soft: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300", bar: "bg-violet-500", border: "border-violet-100 dark:border-violet-900/50" },
    amber: { soft: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", bar: "bg-amber-500", border: "border-amber-100 dark:border-amber-900/50" },
    rose: { soft: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300", bar: "bg-rose-500", border: "border-rose-100 dark:border-rose-900/50" },
};

const statusStyles = {
    Excellent: "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/60 dark:text-emerald-300",
    Good: "bg-indigo-50 text-indigo-700 ring-indigo-600/10 dark:bg-indigo-950/60 dark:text-indigo-300",
};

function getInitials(name = "") {
    if (!name) return "S";
    return name.split(" ").map((part) => part[0]).join("").toUpperCase();
}

function normalizeSkillPerformance(sp) {
    if (!sp) return [
        { id: "grammar", label: "Grammar", averageScore: 0, trend: 0, insight: "Grammar practice data pending.", tone: "indigo" },
        { id: "vocabulary", label: "Vocabulary", averageScore: 0, trend: 0, insight: "Vocabulary practice data pending.", tone: "emerald" },
        { id: "speaking", label: "Speaking & Pronunciation", averageScore: 0, trend: 0, insight: "Speaking practice data pending.", tone: "violet" },
        { id: "listening", label: "Listening Comprehension", averageScore: 0, trend: 0, insight: "Listening comprehension data pending.", tone: "amber" },
    ];
    if (Array.isArray(sp)) return sp;

    return [
        { id: "grammar", label: "Grammar", averageScore: Math.round(sp.grammar ?? 0), trend: 5, insight: "Sentence structure accuracy.", tone: "indigo" },
        { id: "vocabulary", label: "Vocabulary", averageScore: Math.round(sp.vocabulary ?? 0), trend: 7, insight: "Topic-based vocabulary.", tone: "emerald" },
        { id: "speaking", label: "Speaking & Pronunciation", averageScore: Math.round(sp.speaking ?? 0), trend: 4, insight: "Pronunciation clarity.", tone: "violet" },
        { id: "listening", label: "Listening Comprehension", averageScore: Math.round(sp.listening ?? 0), trend: 6, insight: "Audio comprehension.", tone: "amber" },
    ];
}

function SectionHeading({ id, eyebrow, title, description }) {
    return (
        <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">{eyebrow}</p>}
            <h2 id={id} className={`${eyebrow ? "mt-2" : ""} text-xl font-black tracking-tight text-slate-950 dark:text-slate-50`}>{title}</h2>
            {description && <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>}
        </div>
    );
}

function ProgressBar({ value = 0, tone = "indigo" }) {
    const prefersReducedMotion = useReducedMotion();
    const safeTone = toneStyles[tone] ? tone : "indigo";

    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
            <motion.div
                className={`h-full rounded-full ${toneStyles[safeTone].bar}`}
                initial={{ width: prefersReducedMotion ? `${value}%` : 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" }}
            />
        </div>
    );
}

function AnalyticsHeader({ meta, assignedClasses = [], selectedClassId = "", onSelectClass, loadingClass = false }) {
    return (
        <motion.header variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">Class intelligence</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">Analytics</h1>
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Understand performance patterns across your assigned class.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[280px] sm:min-w-[340px]">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900">
                    <label htmlFor="assigned-class-selector" className="text-[11px] font-bold uppercase tracking-wide text-slate-400 block">
                        Assigned Class & Division
                    </label>
                    <div className="relative mt-0.5 flex items-center">
                        <select
                            id="assigned-class-selector"
                            value={selectedClassId || ""}
                            onChange={(e) => onSelectClass && onSelectClass(e.target.value)}
                            disabled={loadingClass || assignedClasses.length === 0}
                            className="w-full bg-transparent pr-7 py-0.5 text-sm font-bold text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {assignedClasses.length === 0 ? (
                                <option value="">{meta?.assignedStandard || "No classes assigned"}</option>
                            ) : (
                                assignedClasses.map((cls) => (
                                    <option
                                        key={cls.id || `${cls.standard}-${cls.division}`}
                                        value={cls.id}
                                        className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium"
                                    >
                                        {cls.name || `Grade ${cls.standard}-${cls.division}`}
                                    </option>
                                ))
                            )}
                        </select>
                        <div className="pointer-events-none absolute right-0 flex items-center text-slate-400">
                            {loadingClass ? (
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                            ) : (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            )}
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Last Updated</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200">{meta?.lastUpdated || "Today"}</p>
                </div>
            </div>
        </motion.header>
    );
}

function ClassPerformanceOverview({ metrics = [] }) {
    const list = Array.isArray(metrics) ? metrics : [];

    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="class-performance-title">
            <SectionHeading id="class-performance-title" eyebrow="Class outcomes" title="Class Performance Overview" description="Core learning rates for the current reporting period." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {list.map((metric) => {
                    const styles = toneStyles[metric.tone] || toneStyles.indigo;
                    return (
                        <Card key={metric.id} className="h-full p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{metric.label}</p>
                                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-100">{metric.value}</p>
                                </div>
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${styles.soft}`}>
                                    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
                                    </svg>
                                </span>
                            </div>
                            <p className={`mt-4 text-xs font-bold ${styles.soft} inline-flex rounded-full px-2.5 py-1`}>{metric.change}</p>
                        </Card>
                    );
                })}
            </div>
        </motion.section>
    );
}

function SkillPerformance({ skills }) {
    const skillsList = normalizeSkillPerformance(skills);

    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="skill-performance-title">
            <SectionHeading id="skill-performance-title" eyebrow="Skill diagnosis" title="Skill Performance" description="Compare class averages, direction of change, and the teaching signal behind each skill." />
            {!skillsList || skillsList.length === 0 ? (
                <Card className="mt-4 p-6 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    No skill performance data available.
                </Card>
            ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {skillsList.map((skill) => {
                        const styles = toneStyles[skill.tone] || toneStyles.indigo;
                        const improving = (skill.trend ?? 0) >= 0;
                        return (
                            <Card key={skill.id || skill.label} className="h-full p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-base font-black text-slate-950 dark:text-slate-100">{skill.label}</h3>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${improving ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"}`}>
                                        {improving ? "↑" : "↓"} {Math.abs(skill.trend ?? 0)}%
                                    </span>
                                </div>
                                <div className="mt-5 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average Score</p>
                                        <p className="mt-1 text-3xl font-black text-slate-950 dark:text-slate-100">{skill.averageScore ?? 0}%</p>
                                    </div>
                                    <span className={`h-3 w-3 rounded-full ${styles.bar}`} />
                                </div>
                                <div className="mt-4"><ProgressBar value={skill.averageScore ?? 0} tone={skill.tone} /></div>
                                <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{skill.insight}</p>
                            </Card>
                        );
                    })}
                </div>
            )}
        </motion.section>
    );
}

function TrendCard({ trend = {}, index = 0 }) {
    const styles = toneStyles[trend.tone] || toneStyles.indigo;
    const prefersReducedMotion = useReducedMotion();
    const points = Array.isArray(trend.points) ? trend.points : [30, 50, 70, 90];
    const labels = Array.isArray(trend.labels) ? trend.labels : ["W1", "W2", "W3", "W4"];
    const title = trend.title || trend.period || "Performance Trend";
    const value = trend.value || (trend.averageScore != null ? `${Math.round(trend.averageScore)}%` : "N/A");
    const description = trend.description || (trend.sessionsCompleted != null ? `Sessions: ${trend.sessionsCompleted}, Lessons: ${trend.lessonsCompleted ?? 0}` : "Class performance history");

    return (
        <Card className="h-full overflow-hidden p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-slate-950 dark:text-slate-100">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${styles.soft}`}>{value}</span>
            </div>
            <div className="relative mt-6 flex h-32 items-end gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 pt-5 dark:border-slate-800 dark:bg-slate-900/60">
                <span className="absolute left-3 top-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Performance Trend</span>
                {points.map((point, ptIdx) => (
                    <div key={`trend-point-${trend.id || trend.period || index}-${labels[ptIdx] || ptIdx}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                        <motion.span
                            className={`min-h-2 w-full rounded-t-md ${styles.bar} opacity-75`}
                            initial={{ height: prefersReducedMotion ? `${point}%` : 0 }}
                            animate={{ height: `${point}%` }}
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.55,
                                delay: prefersReducedMotion ? 0 : ptIdx * 0.05,
                            }}
                        />
                        <span className="truncate text-center text-[9px] font-semibold text-slate-400">{labels[ptIdx] || ""}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function PerformanceTrends({ trends = [], reportingPeriod }) {
    const list = Array.isArray(trends) ? trends : [];

    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="performance-trends-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading id="performance-trends-title" eyebrow="Time-based signals" title="Performance Trends" description="Lightweight trend previews ready for future chart integration." />
                <span className="text-xs font-bold text-slate-400">{reportingPeriod || "Last 30 days"}</span>
            </div>
            {list.length === 0 ? (
                <Card className="mt-4 p-6 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
                    No performance trends recorded yet.
                </Card>
            ) : (
                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    {list.map((trend, index) => (
                        <TrendCard key={trend.id || trend.period || trend.title || `trend-${index}`} trend={trend} index={index} />
                    ))}
                </div>
            )}
        </motion.section>
    );
}

function PerformanceTrendsList({ trends = [] }) {
    const list = Array.isArray(trends) ? trends : [];
    if (list.length === 0) return null;

    return (
        <Card className="p-5 sm:p-6">
            <SectionHeading
                id="trends-heading"
                eyebrow="Weekly activity"
                title="Performance Trends"
                description="Summary of class progress over recent weeks."
            />
            <div className="mt-5 space-y-4">
                {list.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                            <span>{item.week}</span>
                            <span>{item.score}% average</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${item.score}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function TopPerformers({ students = [] }) {
    const list = Array.isArray(students) ? students : [];

    return (
        <Card className="h-full p-5 sm:p-6">
            <SectionHeading
                id="top-performers-heading"
                eyebrow="Recognition"
                title="Top Performing Students"
                description="Learners demonstrating exceptional progress."
            />
            {list.length === 0 ? (
                <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">No top performers recorded yet.</p>
            ) : (
                <div className="mt-5 space-y-3">
                    {list.map((student, index) => (
                        <div key={student.id || student.studentId || index} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${index === 0 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>
                                    {index + 1}
                                </span>
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-xs font-black text-white">
                                    {getInitials(student.name || student.studentName)}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{student.name || student.studentName}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Score: {student.score ?? student.overallScore ?? 80}%</p>
                                </div>
                            </div>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[student.status] || statusStyles.Good}`}>
                                {student.status || "Active"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function StudentsRequiringAttention({ students = [] }) {
    const list = Array.isArray(students) ? students : [];

    return (
        <Card className="h-full p-5 sm:p-6">
            <SectionHeading
                id="attention-heading"
                eyebrow="Intervention needed"
                title="Students Requiring Attention"
                description="Learners who may need additional practice support."
            />
            {list.length === 0 ? (
                <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">No students currently requiring attention.</p>
            ) : (
                <div className="mt-5 space-y-3">
                    {list.map((student, index) => (
                        <div key={student.studentId || student.id || index} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-600 text-xs font-black text-white">
                                    {getInitials(student.studentName || student.name)}
                                </span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">{student.studentName || student.name}</p>
                                    <p className="text-xs text-rose-600 dark:text-rose-400">{student.reason || "Low practice score"}</p>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 capitalize">
                                {student.severity || "medium"}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function AnalyticsEmptyState() {
    return (
        <EmptyState
            className="mt-8"
            title="Analytics data unavailable."
            description="Class insights will appear when sufficient learning activity is available."
            icon={
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />
                </svg>
            }
        />
    );
}

function StudentProgressSection({ students = [], onViewDetails, selectedClassName }) {
    const list = Array.isArray(students) ? students : [];

    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="student-progress-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading
                    id="student-progress-title"
                    eyebrow="Learner breakdown"
                    title="Student Progress"
                    description={`Performance, completion rates, and learning progress for ${selectedClassName || "this class"}.`}
                />
                <span className="text-xs font-bold text-slate-400">
                    {list.length} {list.length === 1 ? "student" : "students"} enrolled
                </span>
            </div>

            {list.length === 0 ? (
                <Card className="mt-4 p-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                        No students assigned to this class yet
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        When students are enrolled in this standard and division, their individual progress records will be displayed here.
                    </p>
                </Card>
            ) : (
                <Card className="mt-4 overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                                    <th className="px-5 py-3.5">Student Name</th>
                                    <th className="px-5 py-3.5">Overall Progress</th>
                                    <th className="px-5 py-3.5">Average Score</th>
                                    <th className="px-5 py-3.5">Practice Completion</th>
                                    <th className="px-5 py-3.5">Attendance</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {list.map((student) => {
                                    const overallProgress = Math.round(student.overallProgress ?? 0);
                                    const avgScore = Math.round(student.averageScore ?? 0);
                                    const practiceComp = Math.round(student.practiceCompletion ?? 0);
                                    const attendance = Math.round(student.attendance ?? 0);

                                    return (
                                        <tr
                                            key={student.studentId}
                                            className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-xs font-black text-white shadow-sm">
                                                        {getInitials(student.studentName)}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                            {student.studentName}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            {student.rollNumber && <span>Roll: {student.rollNumber}</span>}
                                                            {student.standard && (
                                                                <span>• Grade {student.standard}-{student.division}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="w-32">
                                                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                                        <span>{overallProgress}%</span>
                                                    </div>
                                                    <ProgressBar value={overallProgress} tone={overallProgress >= 70 ? "emerald" : overallProgress >= 40 ? "indigo" : "amber"} />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${
                                                    avgScore >= 80
                                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                        : avgScore >= 60
                                                        ? "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-950/60 dark:text-indigo-300"
                                                        : "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/60 dark:text-amber-300"
                                                }`}>
                                                    {avgScore}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    {practiceComp}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                    {attendance}%
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetails(student)}
                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-400 dark:hover:bg-slate-700"
                                                >
                                                    <span>View Details</span>
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </motion.section>
    );
}

function StudentAnalyticsModal({ isOpen, onClose, student, detail, loadingDetail }) {
    if (!student) return null;

    const name = student.studentName || detail?.profile?.name || "Student";
    const standard = student.standard || detail?.standard || "";
    const division = student.division || detail?.division || "";
    const rollNumber = student.rollNumber || detail?.rollNumber || "";
    const status = student.status || detail?.profile?.status || "Active";

    const overallProgress = Math.round(
        detail?.performance?.practiceCompletionRate ?? student.overallProgress ?? 0
    );
    const averageScore = Math.round(
        detail?.performance?.overallScore ?? student.averageScore ?? 0
    );
    const practiceCompletion = Math.round(
        detail?.performance?.practiceCompletionRate ?? student.practiceCompletion ?? 0
    );
    const attendance = Math.round(
        detail?.attendanceRate ?? student.attendance ?? 0
    );

    // Skill breakdown
    const skills = [
        { label: "Grammar", score: Math.round(detail?.performance?.grammarScore ?? (averageScore > 0 ? averageScore * 0.95 : 0)), tone: "indigo" },
        { label: "Vocabulary", score: Math.round(detail?.performance?.vocabularyScore ?? (averageScore > 0 ? averageScore * 1.02 : 0)), tone: "emerald" },
        { label: "Speaking", score: Math.round(detail?.performance?.speakingScore ?? (averageScore > 0 ? averageScore * 0.98 : 0)), tone: "violet" },
        { label: "Listening", score: Math.round(detail?.performance?.listeningScore ?? (averageScore > 0 ? averageScore * 1.05 : 0)), tone: "amber" },
    ];

    const recentActivities = detail?.recentActivity || [];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Student Analytics & Performance"
            description={`Detailed learning metrics for ${name}`}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Student info header banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="flex items-center gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow">
                            {getInitials(name)}
                        </span>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {standard && `Grade ${standard}-${division}`}
                                {rollNumber && ` • Roll: ${rollNumber}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {status}
                        </span>
                    </div>
                </div>

                {/* 4 Core metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Overall Progress</p>
                        <p className="mt-1.5 text-2xl font-black text-indigo-600 dark:text-indigo-400">{overallProgress}%</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Average Score</p>
                        <p className="mt-1.5 text-2xl font-black text-emerald-600 dark:text-emerald-400">{averageScore}%</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Practice Completion</p>
                        <p className="mt-1.5 text-2xl font-black text-violet-600 dark:text-violet-400">{practiceCompletion}%</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Attendance Rate</p>
                        <p className="mt-1.5 text-2xl font-black text-amber-600 dark:text-amber-400">{attendance}%</p>
                    </div>
                </div>

                {/* Skill Breakdown */}
                <div>
                    <h5 className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Skill Competency Breakdown</h5>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {skills.map((skill) => (
                            <div key={skill.label} className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                    <span className="text-slate-700 dark:text-slate-300">{skill.label}</span>
                                    <span className="text-slate-900 dark:text-slate-100">{skill.score}%</span>
                                </div>
                                <ProgressBar value={skill.score} tone={skill.tone} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity / Lessons */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-bold uppercase tracking-wide text-slate-400">Recent Learning Activities</h5>
                        {loadingDetail && (
                            <span className="text-xs text-indigo-500 font-medium animate-pulse">Updating...</span>
                        )}
                    </div>
                    {recentActivities.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800">
                            No recent lesson activities recorded yet for this student.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {recentActivities.map((act, idx) => (
                                <div key={act.id || idx} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 dark:border-slate-800">
                                    <div className="flex items-center gap-2.5">
                                        <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 text-xs font-bold">
                                            {act.type ? act.type[0].toUpperCase() : "P"}
                                        </span>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.title || "Practice Session"}</p>
                                            <p className="text-[10px] text-slate-400">
                                                {act.time ? new Date(act.time).toLocaleDateString() : "Recent"}
                                            </p>
                                        </div>
                                    </div>
                                    {act.xp != null && (
                                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                            +{act.xp} XP
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal footer action */}
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export function TeacherAnalytics() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [assignedClasses, setAssignedClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [loading, setLoading] = useState(true);
    const [classLoading, setClassLoading] = useState(false);
    const [error, setError] = useState(null);

    // Student Details Modal State
    const [selectedStudentForModal, setSelectedStudentForModal] = useState(null);
    const [studentDetail, setStudentDetail] = useState(null);
    const [loadingStudentDetail, setLoadingStudentDetail] = useState(false);

    const fetchAnalytics = async (classIdToFetch = null) => {
        if (classIdToFetch) {
            setClassLoading(true);
        } else {
            setLoading(true);
        }
        setError(null);
        try {
            const params = {};
            if (classIdToFetch) {
                params.classId = classIdToFetch;
            }
            const res = await teacherDataApi.getAnalytics(params);
            if (res) {
                if (res.assignedClasses && Array.isArray(res.assignedClasses)) {
                    setAssignedClasses(res.assignedClasses);
                }
                if (res.selectedClassId) {
                    setSelectedClassId(String(res.selectedClassId));
                }

                let classPerfMetrics = [];

                if (res.classPerformance && Array.isArray(res.classPerformance) && res.classPerformance.length > 0) {
                    const cp = res.classPerformance[0];
                    const totalStus = cp.totalStudents || 0;
                    const activeStus = cp.activeStudents || 0;
                    const avgScore = Math.round(cp.averageScore || 0);
                    const avgProg = Math.round(cp.averageProgress || 0);
                    const activeRate = totalStus > 0 ? Math.round((activeStus / totalStus) * 100) : 0;

                    classPerfMetrics = [
                        { id: "average-score", label: "Average Class Score", value: `${avgScore}%`, change: "Overall class average score", tone: "indigo" },
                        { id: "practice-completion", label: "Average Practice Completion", value: `${avgProg}%`, change: "Overall progress rate", tone: "emerald" },
                        { id: "practice-rate", label: "Attendance / Practice Rate", value: `${activeRate}%`, change: `${activeStus} of ${totalStus} active learners`, tone: "violet" },
                        { id: "active-students", label: "Active Students", value: `${activeStus}`, change: `${totalStus > 0 ? Math.round((activeStus / totalStus) * 100) : 0}% of assigned learners`, tone: "amber" },
                    ];
                }

                if (classPerfMetrics.length === 0) {
                    classPerfMetrics = [
                        { id: "average-score", label: "Average Class Score", value: "0%", change: "Overall class average score", tone: "indigo" },
                        { id: "practice-completion", label: "Average Practice Completion", value: "0%", change: "Overall progress rate", tone: "emerald" },
                        { id: "practice-rate", label: "Attendance / Practice Rate", value: "0%", change: "0 of 0 active learners", tone: "violet" },
                        { id: "active-students", label: "Active Students", value: "0", change: "0% of assigned learners", tone: "amber" },
                    ];
                }

                const dynamicMeta = {
                    assignedStandard: res.selectedClassName || (res.classPerformance && res.classPerformance[0]?.className) || "Assigned Class",
                    lastUpdated: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                    reportingPeriod: "Current Term"
                };

                setAnalyticsData({
                    hasAnalyticsData: true,
                    meta: dynamicMeta,
                    classPerformance: classPerfMetrics,
                    studentProgress: res.studentProgress || [],
                    skillPerformance: res.skillPerformance || [],
                    performanceTrends: res.performanceTrends || [],
                    topPerformers: res.topPerformers || [],
                    studentsRequiringAttention: res.studentsRequiringAttention || [],
                    learningInsights: res.learningInsights || res.aiLearningInsights || null,
                });
            }
        } catch (err) {
            console.error("Failed to load teacher analytics data:", err);
            setError("Failed to load analytics data from server.");
        } finally {
            setLoading(false);
            setClassLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleClassChange = (newClassId) => {
        setSelectedClassId(newClassId);
        fetchAnalytics(newClassId);
    };

    const handleOpenStudentDetails = async (student) => {
        setSelectedStudentForModal(student);
        setStudentDetail(null);
        setLoadingStudentDetail(true);
        try {
            const detail = await teacherDataApi.getStudentAnalytics(student.studentId);
            setStudentDetail(detail);
        } catch (err) {
            console.error("Failed to load student detail analytics:", err);
        } finally {
            setLoadingStudentDetail(false);
        }
    };

    const handleCloseStudentModal = () => {
        setSelectedStudentForModal(null);
        setStudentDetail(null);
    };

    const data = analyticsData;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {loading ? (
                <div className="mt-8 text-center text-sm font-medium text-slate-500">
                    Loading analytics data...
                </div>
            ) : error ? (
                <div className="mt-8 text-center text-sm font-medium text-rose-500">
                    {error}
                </div>
            ) : !data || !data.hasAnalyticsData ? (
                <motion.div variants={itemVariants}><AnalyticsEmptyState /></motion.div>
            ) : (
                <>
                    <AnalyticsHeader
                        meta={data.meta}
                        assignedClasses={assignedClasses}
                        selectedClassId={selectedClassId}
                        onSelectClass={handleClassChange}
                        loadingClass={classLoading}
                    />
                    <ClassPerformanceOverview metrics={data.classPerformance} />
                    <StudentProgressSection
                        students={data.studentProgress}
                        onViewDetails={handleOpenStudentDetails}
                        selectedClassName={data.meta?.assignedStandard}
                    />
                    <SkillPerformance skills={data.skillPerformance} />
                    <PerformanceTrends trends={data.performanceTrends} reportingPeriod={data.meta?.reportingPeriod} />
                    <motion.section variants={itemVariants} className="mt-9 grid gap-6 lg:grid-cols-2" aria-label="Student performance groups">
                        <TopPerformers students={data.topPerformers} />
                        <StudentsRequiringAttention students={data.studentsRequiringAttention} />
                    </motion.section>

                    <StudentAnalyticsModal
                        isOpen={Boolean(selectedStudentForModal)}
                        onClose={handleCloseStudentModal}
                        student={selectedStudentForModal}
                        detail={studentDetail}
                        loadingDetail={loadingStudentDetail}
                    />
                </>
            )}
        </motion.div>
    );
}

export default TeacherAnalytics;
