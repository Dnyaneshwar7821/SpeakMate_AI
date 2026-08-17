import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Card from "@components/common/Card";
import { containerVariants, itemVariants } from "@animations/variants";
import { teacherDashboardMockData } from "@/Admin_panel/data/teacherDashboardMockData";
import { ROUTES } from "@/constants/routes";

const toneStyles = {
    indigo: {
        soft: "bg-indigo-50 text-indigo-600",
        dot: "bg-indigo-500",
        bar: "bg-indigo-500",
    },
    emerald: {
        soft: "bg-emerald-50 text-emerald-600",
        dot: "bg-emerald-500",
        bar: "bg-emerald-500",
    },
    rose: {
        soft: "bg-rose-50 text-rose-600",
        dot: "bg-rose-500",
        bar: "bg-rose-500",
    },
    amber: {
        soft: "bg-amber-50 text-amber-600",
        dot: "bg-amber-500",
        bar: "bg-amber-500",
    },
    violet: {
        soft: "bg-violet-50 text-violet-600",
        dot: "bg-violet-500",
        bar: "bg-violet-500",
    },
};

const overviewIcons = {
    students: (
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87m-3-11.96a4 4 0 0 1 0 7.75" />
    ),
    progress: <path d="M4 19V9m6 10V5m6 14v-7m4 7H2" />,
    attention: (
        <path d="M10.3 2.86 1.82 17a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.7 2.86a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01" />
    ),
    completion: <path d="m4 12 5 5L20 6" />,
};

const actionIcons = {
    students: overviewIcons.students,
    reports: (
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8m-6-6 6 6m-6-6v6h6M8 13h8m-8 4h8" />
    ),
    analytics: overviewIcons.progress,
};

function LineIcon({ children, className = "h-5 w-5" }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            {children}
        </svg>
    );
}

function SectionHeading({ id, eyebrow, title, description }) {
    return (
        <div>
            {eyebrow && (
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-primary)]">
                    {eyebrow}
                </p>
            )}
            <h2 id={id} className={`${eyebrow ? "mt-2" : ""} text-xl font-black text-[var(--text-primary)]`}>
                {title}
            </h2>
            {description && (
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
            )}
        </div>
    );
}

function OverviewCards() {
    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
            {teacherDashboardMockData.overview.map((metric) => {
                const styles = toneStyles[metric.tone];

                return (
                    <motion.div key={metric.id} variants={itemVariants}>
                        <Card className="h-full p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] motion-reduce:transform-none">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-[var(--text-secondary)]">{metric.label}</p>
                                    <p className="mt-3 text-3xl font-black tracking-tight text-[var(--text-primary)]">
                                        {metric.value}
                                    </p>
                                </div>
                                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${styles.soft}`}>
                                    <LineIcon>{overviewIcons[metric.id]}</LineIcon>
                                </span>
                            </div>
                            <p className="mt-3 text-xs font-medium leading-5 text-[var(--text-muted)]">
                                {metric.helper}
                            </p>
                        </Card>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

function PerformanceOverview() {
    return (
        <section className="mt-6" aria-labelledby="performance-heading">
            <SectionHeading
                id="performance-heading"
                eyebrow="Class skills"
                title="Performance overview"
                description="A simple view of the learning areas shaping your class progress."
            />
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
                {teacherDashboardMockData.performance.map((skill) => {
                    const styles = toneStyles[skill.tone];

                    return (
                        <motion.div key={skill.id} variants={itemVariants}>
                            <Card className="h-full overflow-hidden p-5">
                                <div className="flex items-center justify-between gap-3">
                                    <span className={`h-2.5 w-2.5 rounded-full ${styles.dot}`} />
                                    <span className="rounded-full bg-[var(--bg-subtle)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">
                                        Insights soon
                                    </span>
                                </div>
                                <h3 className="mt-5 text-base font-bold text-[var(--text-primary)]">
                                    {skill.label}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{skill.summary}</p>
                                <div className="mt-5 flex h-16 items-end gap-1.5" aria-hidden="true">
                                    {[36, 52, 43, 65, 58, 76, 68].map((height, index) => (
                                        <span
                                            key={`${skill.id}-${height}-${index}`}
                                            className={`flex-1 rounded-t-sm ${styles.bar} opacity-20`}
                                            style={{ height: `${height}%` }}
                                        />
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
}

function AttentionList({ onOpenStudent }) {
    const students = teacherDashboardMockData.studentsRequiringAttention;

    return (
        <Card className="h-full p-5 sm:p-6">
            <SectionHeading
                title="Students requiring attention"
                description="A focused view of learners who may benefit from support."
            />
            {students.length === 0 ? (
                <p className="mt-5 rounded-xl bg-[var(--bg-subtle)] px-4 py-6 text-center text-sm font-medium text-[var(--text-muted)]">
                    No students currently require attention.
                </p>
            ) : (
                <div className="mt-5 divide-y divide-[var(--border-subtle)]">
                    {students.map((student) => (
                        <button
                            key={student.id}
                            type="button"
                            onClick={() => onOpenStudent(student.id)}
                            aria-label={`View ${student.name}'s student profile`}
                            className="group block w-full cursor-pointer rounded-xl py-4 text-left transition duration-200 first:pt-0 last:pb-0 hover:bg-[var(--color-primary)]/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 active:scale-[0.99] motion-reduce:transform-none"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-500/10 text-xs font-black text-rose-600">
                                            {student.name
                                                .split(" ")
                                                .map((part) => part[0])
                                                .join("")}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-[var(--text-primary)]">{student.name}</p>
                                            <p className="mt-0.5 truncate text-xs font-medium text-[var(--text-secondary)]">
                                                {student.reason}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-600">
                                    {student.progress}%
                                </span>
                            </div>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                                <div
                                    className="h-full rounded-full bg-rose-400"
                                    style={{ width: `${student.progress}%` }}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
}

function RecentActivity() {
    const activities = teacherDashboardMockData.recentActivity;

    return (
        <Card className="h-full p-5 sm:p-6">
            <SectionHeading
                title="Recent activity"
                description="Latest learning moments from your assigned class."
            />
            {activities.length === 0 ? (
                <p className="mt-5 rounded-xl bg-[var(--bg-subtle)] px-4 py-6 text-center text-sm font-medium text-[var(--text-muted)]">
                    No recent activity is available.
                </p>
            ) : (
                <ol className="mt-5 space-y-4">
                    {activities.map((activity) => {
                        const styles = toneStyles[activity.tone];

                        return (
                            <li key={`${activity.student}-${activity.action}`} className="flex gap-3">
                                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`} />
                                <div className="min-w-0 flex-1 border-b border-[var(--border-subtle)] pb-4 last:border-0 last:pb-0">
                                    <p className="text-sm leading-6 text-[var(--text-secondary)]">
                                        <span className="font-bold text-[var(--text-primary)]">{activity.student}</span>{" "}
                                        {activity.action}
                                    </p>
                                    <p className="mt-0.5 text-xs font-medium text-[var(--text-muted)]">{activity.time}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}
        </Card>
    );
}

function QuickActions({ onOpenAction }) {
    return (
        <section className="mt-6" aria-labelledby="quick-actions-heading">
            <SectionHeading
                id="quick-actions-heading"
                eyebrow="Next steps"
                title="Quick actions"
                description="Common teacher tasks, ready for future workspace pages."
            />
            <div className="mt-4 grid gap-4 md:grid-cols-3">
                {teacherDashboardMockData.quickActions.map((action) => (
                    <Card
                        key={action.title}
                        className="group overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-[var(--color-primary)]/30 hover:shadow-[var(--shadow-md)] focus-within:-translate-y-0.5 focus-within:border-[var(--color-primary)]/30 focus-within:shadow-[var(--shadow-md)] motion-reduce:transform-none"
                    >
                        <button
                            type="button"
                            onClick={() => onOpenAction(action.icon)}
                            aria-label={`${action.title}: ${action.description}`}
                            className="h-full w-full cursor-pointer p-5 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary)] active:scale-[0.99] motion-reduce:transform-none"
                        >
                            <div className="flex items-start gap-4">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition-colors duration-200 group-hover:bg-[var(--color-primary)] group-hover:text-white">
                                    <LineIcon>{actionIcons[action.icon]}</LineIcon>
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-[var(--text-primary)]">{action.title}</h3>
                                    <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{action.description}</p>
                                    <span className="mt-3 inline-flex items-center text-sm font-bold text-[var(--color-primary)]">
                                        Open workspace
                                        <span aria-hidden="true" className="ml-1 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">
                                            →
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </button>
                    </Card>
                ))}
            </div>
        </section>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

export function TeacherDashboardHome() {
    const navigate = useNavigate();
    const { teacher } = teacherDashboardMockData;
    const quickActionRoutes = {
        students: ROUTES.TEACHER_STUDENTS,
        analytics: ROUTES.TEACHER_ANALYTICS,
        reports: ROUTES.TEACHER_REPORTS,
    };
    const navigateTo = (path) => navigate(path);
    const formattedDate = new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date());

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.section variants={itemVariants} className="mb-6" aria-labelledby="welcome-heading">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-primary)]">
                            Teacher dashboard
                        </p>
                        <p className="mt-3 text-base font-semibold text-[var(--text-secondary)]">{getGreeting()},</p>
                        <h1 id="welcome-heading" className="mt-1 text-3xl font-black tracking-tight text-[var(--text-primary)] sm:text-4xl">
                            {teacher.name}
                        </h1>
                        <p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">
                            {teacher.assignedStandard}
                        </p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 shadow-[var(--shadow-sm)]">
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--text-muted)]">Today</p>
                        <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{formattedDate}</p>
                    </div>
                </div>
            </motion.section>

            <section aria-label="Class overview">
                <OverviewCards />
            </section>

            <PerformanceOverview />

            <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mt-6 grid gap-6 lg:grid-cols-2"
                aria-label="Student attention and recent activity"
            >
                <motion.div variants={itemVariants}>
                    <AttentionList
                        onOpenStudent={(studentId) => navigateTo(
                            ROUTES.TEACHER_STUDENT_DETAILS.replace(":studentId", studentId),
                        )}
                    />
                </motion.div>
                <motion.div variants={itemVariants}>
                    <RecentActivity />
                </motion.div>
            </motion.section>

            <QuickActions onOpenAction={(action) => navigateTo(quickActionRoutes[action])} />
        </motion.div>
    );
}

export default TeacherDashboardHome;
