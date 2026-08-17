import { motion, useReducedMotion } from "framer-motion";

import { containerVariants, itemVariants } from "@animations/variants";
import Card from "@components/common/Card";
import EmptyState from "@/Admin_panel/components/teacher/common/EmptyState";
import { teacherAnalyticsMockData } from "@/Admin_panel/data/teacherAnalyticsMockData";

const toneStyles = {
    indigo: { soft: "bg-indigo-50 text-indigo-700", bar: "bg-indigo-500", border: "border-indigo-100" },
    emerald: { soft: "bg-emerald-50 text-emerald-700", bar: "bg-emerald-500", border: "border-emerald-100" },
    violet: { soft: "bg-violet-50 text-violet-700", bar: "bg-violet-500", border: "border-violet-100" },
    amber: { soft: "bg-amber-50 text-amber-700", bar: "bg-amber-500", border: "border-amber-100" },
    rose: { soft: "bg-rose-50 text-rose-700", bar: "bg-rose-500", border: "border-rose-100" },
};

const statusStyles = {
    Excellent: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    Good: "bg-indigo-50 text-indigo-700 ring-indigo-600/10",
};

function getInitials(name) {
    return name.split(" ").map((part) => part[0]).join("");
}

function SectionHeading({ id, eyebrow, title, description }) {
    return (
        <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">{eyebrow}</p>}
            <h2 id={id} className={`${eyebrow ? "mt-2" : ""} text-xl font-black tracking-tight text-slate-950`}>{title}</h2>
            {description && <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>}
        </div>
    );
}

function ProgressBar({ value, tone }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
            <motion.div
                className={`h-full rounded-full ${toneStyles[tone].bar}`}
                initial={{ width: prefersReducedMotion ? `${value}%` : 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" }}
            />
        </div>
    );
}

function AnalyticsHeader({ meta }) {
    return (
        <motion.header variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Class intelligence</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Analytics</h1>
                <p className="mt-2 text-sm font-medium text-slate-500">Understand performance patterns across your assigned class.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned Standard</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{meta.assignedStandard}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Last Updated</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">{meta.lastUpdated}</p>
                </div>
            </div>
        </motion.header>
    );
}

function ClassPerformanceOverview({ metrics }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="class-performance-title">
            <SectionHeading id="class-performance-title" eyebrow="Class outcomes" title="Class Performance Overview" description="Core learning rates for the current reporting period." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => {
                    const styles = toneStyles[metric.tone];
                    return (
                        <Card key={metric.id} className="h-full p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                                    <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{metric.value}</p>
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
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="skill-performance-title">
            <SectionHeading id="skill-performance-title" eyebrow="Skill diagnosis" title="Skill Performance" description="Compare class averages, direction of change, and the teaching signal behind each skill." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {skills.map((skill) => {
                    const styles = toneStyles[skill.tone];
                    const improving = skill.trend >= 0;
                    return (
                        <Card key={skill.id} className="h-full p-5">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-base font-black text-slate-950">{skill.label}</h3>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${improving ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                    {improving ? "↑" : "↓"} {Math.abs(skill.trend)}%
                                </span>
                            </div>
                            <div className="mt-5 flex items-end justify-between gap-3">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Average Score</p>
                                    <p className="mt-1 text-3xl font-black text-slate-950">{skill.averageScore}%</p>
                                </div>
                                <span className={`h-3 w-3 rounded-full ${styles.bar}`} />
                            </div>
                            <div className="mt-4"><ProgressBar value={skill.averageScore} tone={skill.tone} /></div>
                            <p className="mt-4 text-sm leading-6 text-slate-500">{skill.insight}</p>
                        </Card>
                    );
                })}
            </div>
        </motion.section>
    );
}

function TrendCard({ trend }) {
    const styles = toneStyles[trend.tone];
    const prefersReducedMotion = useReducedMotion();

    return (
        <Card className="h-full overflow-hidden p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-base font-black text-slate-950">{trend.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{trend.description}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${styles.soft}`}>{trend.value}</span>
            </div>
            <div className="relative mt-6 flex h-32 items-end gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-3 pt-5">
                <span className="absolute left-3 top-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Chart placeholder</span>
                {trend.points.map((point, index) => (
                    <div key={`${trend.id}-${trend.labels[index]}`} className="flex h-full flex-1 flex-col justify-end gap-2">
                        <motion.span
                            className={`min-h-2 w-full rounded-t-md ${styles.bar} opacity-75`}
                            initial={{ height: prefersReducedMotion ? `${point}%` : 0 }}
                            animate={{ height: `${point}%` }}
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.55,
                                delay: prefersReducedMotion ? 0 : index * 0.05,
                            }}
                        />
                        <span className="truncate text-center text-[9px] font-semibold text-slate-400">{trend.labels[index]}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function PerformanceTrends({ trends, reportingPeriod }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="performance-trends-title">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <SectionHeading id="performance-trends-title" eyebrow="Time-based signals" title="Performance Trends" description="Lightweight trend previews ready for future chart integration." />
                <span className="text-xs font-bold text-slate-400">{reportingPeriod}</span>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                {trends.map((trend) => <TrendCard key={trend.id} trend={trend} />)}
            </div>
        </motion.section>
    );
}

function TopPerformers({ students }) {
    return (
        <Card className="h-full p-5 sm:p-6">
            <SectionHeading title="Top Performing Students" description="Learners leading overall class outcomes." />
            <ol className="mt-5 divide-y divide-slate-100">
                {students.map((student, index) => (
                    <li key={student.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
                        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black ${index === 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{index + 1}</span>
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-black text-indigo-700">{getInitials(student.name)}</span>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-950">{student.name}</p>
                            <p className="mt-0.5 text-xs font-medium text-slate-500">Overall score {student.overallScore}%</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[student.status]}`}>{student.status}</span>
                    </li>
                ))}
            </ol>
        </Card>
    );
}

function StudentsRequiringAttention({ students }) {
    return (
        <Card className="h-full p-5 sm:p-6">
            <SectionHeading title="Students Requiring Attention" description="Skill-specific signals and suggested next teaching steps." />
            <div className="mt-5 space-y-4">
                {students.map((student) => (
                    <div key={student.id} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-50 text-xs font-black text-rose-700">{getInitials(student.name)}</span>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-bold text-slate-950">{student.name}</p>
                                    <p className="mt-0.5 text-xs font-semibold text-rose-600">Focus: {student.weakSkill}</p>
                                </div>
                            </div>
                            <span className="text-sm font-black text-slate-900">{student.currentProgress}%</span>
                        </div>
                        <div className="mt-3"><ProgressBar value={student.currentProgress} tone="rose" /></div>
                        <p className="mt-3 text-xs leading-5 text-slate-500"><span className="font-bold text-slate-700">Recommendation:</span> {student.recommendation}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function LearningInsights({ insights }) {
    return (
        <motion.section variants={itemVariants} className="mt-9" aria-labelledby="learning-insights-title">
            <SectionHeading id="learning-insights-title" eyebrow="Teaching signals" title="Learning Insights" description="Compact observations drawn from the placeholder class trends." />
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {insights.map((insight) => {
                    const styles = toneStyles[insight.tone];
                    return (
                        <Card key={insight.id} className={`h-full border-l-4 p-5 ${styles.border}`}>
                            <span className={`grid h-9 w-9 place-items-center rounded-xl ${styles.soft}`}>
                                <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18h6M10 22h4M8.5 14.5A7 7 0 1 1 15.5 14.5c-.9.7-1.5 1.5-1.5 2.5h-4c0-1-.6-1.8-1.5-2.5Z" />
                                </svg>
                            </span>
                            <h3 className="mt-4 text-sm font-black text-slate-950">{insight.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">{insight.detail}</p>
                        </Card>
                    );
                })}
            </div>
        </motion.section>
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

export function TeacherAnalytics() {
    const data = teacherAnalyticsMockData;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <AnalyticsHeader meta={data.meta} />
            {!data.hasAnalyticsData ? (
                <motion.div variants={itemVariants}><AnalyticsEmptyState /></motion.div>
            ) : (
                <>
                    <ClassPerformanceOverview metrics={data.classPerformance} />
                    <SkillPerformance skills={data.skillPerformance} />
                    <PerformanceTrends trends={data.performanceTrends} reportingPeriod={data.meta.reportingPeriod} />
                    <motion.section variants={itemVariants} className="mt-9 grid gap-6 lg:grid-cols-2" aria-label="Student performance groups">
                        <TopPerformers students={data.topPerformers} />
                        <StudentsRequiringAttention students={data.studentsRequiringAttention} />
                    </motion.section>
                    <LearningInsights insights={data.learningInsights} />
                </>
            )}
        </motion.div>
    );
}

export default TeacherAnalytics;
