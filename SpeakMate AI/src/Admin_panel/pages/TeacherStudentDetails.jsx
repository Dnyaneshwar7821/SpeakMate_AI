import { motion, useReducedMotion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";

import { containerVariants, itemVariants } from "@animations/variants";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import ROUTES from "@constants/routes";
import ErrorState from "@/Admin_panel/components/teacher/common/ErrorState";
import { teacherStudentDetailsMockData } from "@/Admin_panel/data/teacherStudentDetailsMockData";

const statusStyles = {
    Excellent: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
    Good: "bg-indigo-50 text-indigo-700 ring-indigo-600/10",
    Average: "bg-amber-50 text-amber-700 ring-amber-600/10",
    "Needs Attention": "bg-rose-50 text-rose-700 ring-rose-600/10",
};

const progressStyles = {
    Excellent: "bg-emerald-500",
    Good: "bg-indigo-500",
    Average: "bg-amber-500",
    "Needs Attention": "bg-rose-500",
};

const activityDotStyles = {
    indigo: "bg-indigo-500 ring-indigo-100",
    emerald: "bg-emerald-500 ring-emerald-100",
    amber: "bg-amber-500 ring-amber-100",
    violet: "bg-violet-500 ring-violet-100",
};

const achievementStyles = {
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("");
}

function BackIcon() {
    return (
        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
        </svg>
    );
}

function AchievementIcon({ type }) {
    const paths = {
        grammar: <><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" /><path d="M8 4v13a3 3 0 0 0 3 3M9 8h6M9 12h5" /></>,
        vocabulary: <><path d="m12 3 2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2-3.8-3.7 5.2-.8L12 3Z" /></>,
        streak: <><path d="M12 22c4 0 7-2.7 7-6.5 0-2.4-1.2-4.5-3.5-6.5.1 2-1 3.3-2.2 3.9.2-4-2-7.2-5.3-9.4.3 3.7-3 6.7-3 11.4C5 19 8.1 22 12 22Z" /><path d="M9.5 18.5c0-1.7 1.1-3 2.5-4.3 1.4 1.3 2.5 2.6 2.5 4.3" /></>,
    };

    return (
        <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            {paths[type]}
        </svg>
    );
}

function SectionHeader({ id, title, description }) {
    return (
        <div>
            <h2 id={id} className="text-base font-black text-slate-950">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
    );
}

function ProgressBar({ value, tone = "bg-indigo-500" }) {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100">
            <motion.div
                className={`h-full rounded-full ${tone}`}
                initial={{ width: prefersReducedMotion ? `${value}%` : 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" }}
            />
        </div>
    );
}

function ProfileHeader({ student, onBack }) {
    return (
        <motion.div variants={itemVariants}>
            <Button variant="ghost" onClick={onBack} className="h-9 gap-2 px-3 text-slate-600">
                <BackIcon />
                Back to Students
            </Button>
            <Card className="mt-4 overflow-hidden">
                <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Student profile</p>
                </div>
                <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-lg font-black text-indigo-700 ring-1 ring-indigo-100 sm:h-20 sm:w-20 sm:text-xl">
                            {getInitials(student.name)}
                        </span>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-black text-slate-950 sm:text-3xl">{student.name}</h1>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-slate-500">
                                <span>Roll no. {student.rollNumber}</span>
                                <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                                <span>{student.assignedStandard}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Overall Progress</p>
                            <p className="mt-1 text-xl font-black text-slate-950">{student.overallProgress}%</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Current Status</p>
                            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[student.status]}`}>
                                {student.status}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}

function PerformanceSummary({ student }) {
    const metrics = [
        ["Overall Progress", student.overallProgress, progressStyles[student.status]],
        ["Grammar", student.grammar, "bg-indigo-500"],
        ["Vocabulary", student.vocabulary, "bg-amber-500"],
        ["Speaking", student.speaking, "bg-emerald-500"],
        ["Listening", student.listening, "bg-violet-500"],
        ["Practice Completion", student.practiceCompletion, "bg-rose-500"],
    ];

    return (
        <motion.section variants={itemVariants} className="mt-6" aria-labelledby="performance-summary-title">
            <SectionHeader id="performance-summary-title" title="Performance Summary" description="A current snapshot of learning outcomes and practice completion." />
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                {metrics.map(([label, value, tone]) => (
                    <Card key={label} className="p-4">
                        <p className="min-h-10 text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
                        <p className="mt-2 text-2xl font-black text-slate-950">{value}%</p>
                        <div className="mt-3"><ProgressBar value={value} tone={tone} /></div>
                    </Card>
                ))}
            </div>
        </motion.section>
    );
}

function LearningProgress({ student }) {
    const skills = [
        ["Grammar", student.grammar, "bg-indigo-500"],
        ["Vocabulary", student.vocabulary, "bg-amber-500"],
        ["Speaking", student.speaking, "bg-emerald-500"],
        ["Listening", student.listening, "bg-violet-500"],
    ];

    return (
        <Card className="p-5 sm:p-6">
            <SectionHeader title="Learning Progress" description="Skill-level progress for the assigned standard." />
            <div className="mt-6 space-y-5">
                {skills.map(([label, value, tone]) => (
                    <div key={label}>
                        <div className="mb-2 flex items-center justify-between gap-4">
                            <span className="text-sm font-bold text-slate-700">{label}</span>
                            <span className="text-sm font-black text-slate-950">{value}%</span>
                        </div>
                        <ProgressBar value={value} tone={tone} />
                    </div>
                ))}
            </div>
        </Card>
    );
}

function LearningActivity({ activities }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeader title="Learning Activity" description="Recent practice completed by the student." />
            <ol className="mt-6 space-y-0">
                {activities.map((activity, index) => (
                    <li key={activity.id} className="relative flex gap-4 pb-5 last:pb-0">
                        {index < activities.length - 1 && <span className="absolute left-[5px] top-4 h-full w-px bg-slate-200" />}
                        <span className={`relative mt-1.5 h-3 w-3 shrink-0 rounded-full ring-4 ${activityDotStyles[activity.tone]}`} />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                <h3 className="text-sm font-bold text-slate-900">{activity.title}</h3>
                                <time className="shrink-0 text-xs font-semibold text-slate-400">{activity.time}</time>
                            </div>
                            <p className="mt-1 text-sm leading-6 text-slate-500">{activity.detail}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </Card>
    );
}

function StrengthsAndImprovements({ strengths, improvementAreas }) {
    const groups = [
        { title: "Strengths", items: strengths, tone: "emerald", marker: "text-emerald-600 bg-emerald-50" },
        { title: "Improvement Areas", items: improvementAreas, tone: "amber", marker: "text-amber-700 bg-amber-50" },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => (
                <Card key={group.title} className="p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                        <span className={`grid h-9 w-9 place-items-center rounded-xl ${group.marker}`}>
                            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {group.tone === "emerald" ? <path d="m5 12 4 4L19 6" /> : <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.7 2.5 17.2A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.8L13.7 3.7a2 2 0 0 0-3.4 0Z" /></>}
                            </svg>
                        </span>
                        <h2 className="text-base font-black text-slate-950">{group.title}</h2>
                    </div>
                    <ul className="mt-5 space-y-3">
                        {group.items.map((item) => (
                            <li key={item} className="flex gap-3 text-sm leading-6 text-slate-600">
                                <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${group.tone === "emerald" ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {item}
                            </li>
                        ))}
                    </ul>
                </Card>
            ))}
        </div>
    );
}

function Achievements({ achievements }) {
    return (
        <Card className="p-5 sm:p-6">
            <SectionHeader title="Achievements" description="Badges earned through learning and practice milestones." />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {achievements.map((achievement) => (
                    <div key={achievement.id} className="rounded-xl border border-slate-200 p-4">
                        <span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${achievementStyles[achievement.tone]}`}>
                            <AchievementIcon type={achievement.icon} />
                        </span>
                        <h3 className="mt-4 text-sm font-black text-slate-950">{achievement.title}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{achievement.description}</p>
                        <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Earned {achievement.earnedOn}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function PracticeOverview({ practice }) {
    const items = [
        ["Practice Days", practice.practiceDays],
        ["Current Streak", `${practice.currentStreak} days`],
        ["Last Practice", practice.lastPractice],
        ["Weekly Completion", `${practice.weeklyCompletion}%`],
    ];

    return (
        <Card className="p-5 sm:p-6">
            <SectionHeader title="Attendance / Practice Overview" description="A lightweight view of recent learning consistency." />
            <dl className="mt-5 grid grid-cols-2 gap-3">
                {items.map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt>
                        <dd className="mt-2 text-base font-black text-slate-900">{value}</dd>
                    </div>
                ))}
            </dl>
            <div className="mt-4">
                <ProgressBar value={practice.weeklyCompletion} tone="bg-emerald-500" />
            </div>
        </Card>
    );
}

function StudentNotFound({ onBack }) {
    return (
        <ErrorState
            titleAs="h1"
            title="Student profile not found"
            description="This student is not available in the assigned class."
            icon={
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 0 1 4.8 1c0 2-2.3 2.1-2.3 4M12 18h.01" />
                </svg>
            }
            action={
                <Button variant="secondary" onClick={onBack} className="gap-2">
                    <BackIcon />
                    Back to Students
                </Button>
            }
        />
    );
}

export function TeacherStudentDetails() {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const student = teacherStudentDetailsMockData[studentId];
    const goToStudents = () => navigate(ROUTES.TEACHER_STUDENTS);

    if (!student) {
        return <StudentNotFound onBack={goToStudents} />;
    }

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <ProfileHeader student={student} onBack={goToStudents} />
            <PerformanceSummary student={student} />

            <motion.div variants={itemVariants} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)] lg:items-start">
                <div className="grid gap-6">
                    <LearningProgress student={student} />
                    <LearningActivity activities={student.recentActivity} />
                    <StrengthsAndImprovements strengths={student.strengths} improvementAreas={student.improvementAreas} />
                </div>
                <div className="grid gap-6">
                    <PracticeOverview practice={student.practice} />
                    <Achievements achievements={student.achievements} />
                </div>
            </motion.div>
        </motion.div>
    );
}

export default TeacherStudentDetails;
