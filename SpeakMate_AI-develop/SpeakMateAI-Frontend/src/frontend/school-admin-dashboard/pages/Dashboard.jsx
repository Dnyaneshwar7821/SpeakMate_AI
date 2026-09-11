import { useState, useEffect, useMemo } from "react";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Plus, Users, Calendar, Award, TrendingUp, Bell, CheckCircle2, Star, Clock } from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

import Button from "@components/common/Button";
import Input from "@components/common/Input";

import KpiCard from "@school-admin/components/KpiCard";
import SectionCard from "@school-admin/components/SectionCard";
import ResultsTable from "@school-admin/components/ResultsTable";
import ResultDetailsModal from "@school-admin/components/ResultDetailsModal";

// Interactive Modals
import UserFormModal from "@admin/components/UserFormModal";
import TeacherFormModal from "@school-admin/components/TeacherFormModal";

import { useResults, useStudents, useTeachers } from "@school-admin/hooks/useSchoolData";
import { getInitials } from "@utils/formatters";
import InsigniaBadge from "@components/common/InsigniaBadge";

export function Dashboard() {
    const { results, totalResults, searchTerm, setSearchTerm } = useResults();
    const { students, addStudent } = useStudents();
    const { teachers, addTeacher } = useTeachers();

    // UI States
    const [selectedResult, setSelectedResult] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    // Modal States
    const [studentModalOpen, setStudentModalOpen] = useState(false);
    const [teacherModalOpen, setTeacherModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState([]);
    const triggerToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    // Dynamic API Data States
    const [stats, setStats] = useState(null);
    const [insights, setInsights] = useState(null);
    const [schoolInfo, setSchoolInfo] = useState({ name: "Loading...", code: "Loading...", location: "Loading..." });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const dashboardStats = await schoolAdminDataApi.getDashboardStats();
                setStats(dashboardStats);
                setSchoolInfo({
                    id: dashboardStats.schoolId || null,
                    name: dashboardStats.schoolName || "",
                    code: dashboardStats.schoolCode || "",
                    location: dashboardStats.schoolAddress || ""
                });
            } catch (err) {
                console.error("Failed to load school dashboard stats:", err);
            }

            try {
                const insightsRes = await schoolAdminDataApi.getInsights("6m");
                setInsights(insightsRes);
            } catch (err) {
                console.error("Failed to load school insights:", err);
            }
        };
        fetchDashboardData();

        const handleUpdate = () => {
            fetchDashboardData();
        };
        window.addEventListener("school_data_updated", handleUpdate);
        return () => window.removeEventListener("school_data_updated", handleUpdate);
    }, []);

    const recentResults = results.slice(0, 5);

    // Calculate actual total tests & avg score from real results DB
    const hasResults = results && results.length > 0;
    const realTotalTests = hasResults ? results.length : (stats?.totalResults || 0);
    const realAvgScore = hasResults
        ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length)
        : (stats?.averageResultPercentage ? Math.round(stats.averageResultPercentage) : 0);

    // Dynamic Performance Chart Data based strictly on actual test results
    const performanceData = useMemo(() => {
        // Build array of month names for the last 6 months
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d.toLocaleString('default', { month: 'short' }));
        }

        const monthMap = {};
        months.forEach(m => { monthMap[m] = { scoreSum: 0, count: 0 }; });

        let recordedTestsCount = 0;
        if (results && results.length > 0) {
            results.forEach((r) => {
                if (r.submittedAt) {
                    const date = new Date(r.submittedAt);
                    const monthName = date.toLocaleString('default', { month: 'short' });
                    if (monthMap[monthName]) {
                        monthMap[monthName].scoreSum += (r.percentage || 0);
                        monthMap[monthName].count += 1;
                        recordedTestsCount += 1;
                    }
                }
            });
        }

        // If no tests have been given by any user, return 0 score and 0 tests for all months
        if (recordedTestsCount === 0 && (!insights?.trends || insights.trends.length === 0)) {
            return months.map(m => ({
                month: m,
                avgScore: 0,
                tests: 0
            }));
        }

        if (insights?.trends && insights.trends.length > 0) {
            return insights.trends.map((t) => ({
                month: t.label || "Month",
                avgScore: Math.round(t.fluency || t.pronunciation || 0),
                tests: t.testsCount || 0
            }));
        }

        return months.map((m) => ({
            month: m,
            avgScore: monthMap[m].count > 0 ? Math.round(monthMap[m].scoreSum / monthMap[m].count) : 0,
            tests: monthMap[m].count
        }));
    }, [insights, results]);

    // Dynamic Top Performers Leaderboard using real test scores
    const topStudents = useMemo(() => {
        if (!students || students.length === 0) return [];

        const studentStats = {};
        if (results && results.length > 0) {
            results.forEach((r) => {
                const sName = (r.studentName || "").trim().toLowerCase();
                if (sName) {
                    if (!studentStats[sName]) {
                        studentStats[sName] = { totalPercentage: 0, testCount: 0 };
                    }
                    studentStats[sName].totalPercentage += (r.percentage || 0);
                    studentStats[sName].testCount += 1;
                }
            });
        }

        const calculated = students.map((s, idx) => {
            const sNameKey = (s.name || "").trim().toLowerCase();
            const stData = studentStats[sNameKey];

            let scoreVal = null;
            let testCount = 0;

            if (stData && stData.testCount > 0) {
                scoreVal = Math.round(stData.totalPercentage / stData.testCount);
                testCount = stData.testCount;
            } else if (typeof s.averageScore === 'number' && s.averageScore > 0) {
                scoreVal = Math.round(s.averageScore);
            }

            return {
                id: s.id || `st-${idx}`,
                name: s.name,
                standard: s.standard ? `Class ${s.standard}` : "Class 10",
                score: scoreVal,
                scoreDisplay: scoreVal !== null ? `${scoreVal}%` : "No tests",
                testCount: testCount
            };
        });

        return calculated.sort((a, b) => {
            if (a.score === null && b.score === null) return 0;
            if (a.score === null) return 1;
            if (b.score === null) return -1;
            return b.score - a.score;
        }).slice(0, 5);
    }, [students, results]);

    // Dynamic Live Activity Feed from real backend events
    const recentActivities = useMemo(() => {
        const list = [];

        if (results && results.length > 0) {
            results.slice(0, 3).forEach((r, i) => {
                list.push({
                    id: `res-${r.id || i}`,
                    type: "test",
                    message: `${r.studentName} completed ${r.testTitle} (${r.percentage}%)`,
                    time: r.submittedAt ? `${r.submittedAt}` : "Recent",
                    icon: CheckCircle2,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/10"
                });
            });
        }

        if (students && students.length > 0) {
            students.slice(0, 2).forEach((s, i) => {
                list.push({
                    id: `st-reg-${s.id || i}`,
                    type: "user",
                    message: `${s.name} enrolled in Class ${s.standard || 10}`,
                    time: s.joinedAt ? `${s.joinedAt}` : "Recently",
                    icon: Star,
                    color: "text-amber-500",
                    bg: "bg-amber-500/10"
                });
            });
        }

        if (teachers && teachers.length > 0) {
            const latestTeacher = teachers[0];
            list.push({
                id: `tch-${latestTeacher.id || 1}`,
                type: "user",
                message: `Teacher ${latestTeacher.name} assigned to school`,
                time: "Recently",
                icon: Users,
                color: "text-[var(--color-primary)]",
                bg: "bg-[var(--color-primary)]/10"
            });
        }

        return list.slice(0, 4);
    }, [results, students, teachers]);

    const totalStudentsVal = stats?.totalStudents ?? students.length;
    const activeStudentsVal = stats?.activeStudents ?? students.filter(s => s.status === 'active').length;

    const topRowKpis = [
        { id: "total-students", label: "Total Students", value: totalStudentsVal, change: null, trend: "up", icon: "users", accent: "#6c63ff" },
        { id: "active-students", label: "Active Students", value: activeStudentsVal, change: null, trend: "up", icon: "users", accent: "#22c55e" },
    ];

    const secondRowKpis = [
        { id: "total-tests", label: "Total Tests", value: realTotalTests, change: null, trend: "up", icon: "clipboard", accent: "#6c63ff" },
        { id: "recent-results", label: "Recent Results", value: results.length, change: null, trend: "up", icon: "chart", accent: "#ff6584" },
        { id: "avg-score", label: "School Avg Score", value: `${realAvgScore}%`, change: null, trend: "up", icon: "award", accent: "#eab308" },
    ];

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await schoolAdminDataApi.exportStudents("csv");
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `students_export_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error("Export error:", err);
        } finally {
            setTimeout(() => setIsExporting(false), 1500);
        }
    };

    const handleAddStudent = async (data) => {
        setIsSubmitting(true);
        try {
            const res = await addStudent(data);
            if (res?.emailSent !== false) {
                triggerToast(`Student created successfully and login credentials have been sent to ${data.email}.`);
            } else {
                triggerToast("Student created successfully, but the credential email could not be sent.");
            }
            setStudentModalOpen(false);
        } catch (err) {
            triggerToast(err.message || "Failed to add student.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddTeacher = async (data) => {
        setIsSubmitting(true);
        try {
            await addTeacher(data);
            triggerToast("Teacher added successfully.");
            setTeacherModalOpen(false);
        } catch (err) {
            triggerToast(err.message || "Failed to add teacher.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">

            {/* Header section with gradient and quick actions */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:p-8"
            >
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20 blur-3xl"
                    style={{ background: "linear-gradient(135deg,#6c63ff,#ff6584)" }}
                />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Live Dashboard
                        </span>
                        <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                            Command Center
                        </h1>
                        <p className="mt-1.5 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">
                            Monitor students, track real-time performance, and manage school operations.
                        </p>

                        {/* School Details */}
                        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-[var(--text-secondary)]">
                            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5 border border-[var(--border-subtle)] shadow-sm transition hover:border-[var(--color-primary)]">
                                <span className="text-[var(--text-muted)]">School:</span>
                                <span className="text-[var(--text-primary)] font-bold">{schoolInfo.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5 border border-[var(--border-subtle)] shadow-sm transition hover:border-[var(--color-primary)]">
                                <span className="text-[var(--text-muted)]">Code:</span>
                                <span className="text-[var(--text-primary)] font-bold">{schoolInfo.code}</span>
                            </div>
                            <div className="flex items-center gap-1.5 rounded-lg bg-[var(--bg-elevated)] px-2.5 py-1.5 border border-[var(--border-subtle)] shadow-sm transition hover:border-[var(--color-primary)]">
                                <span className="text-[var(--text-muted)]">Location:</span>
                                <span className="text-[var(--text-primary)] font-bold">{schoolInfo.location}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Panel */}
                    <div className="flex shrink-0 flex-wrap gap-3 rounded-xl bg-[var(--bg-elevated)] p-2 border border-[var(--border-subtle)]">
                        <Button className="!h-10 !px-4 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5" onClick={() => setStudentModalOpen(true)}>
                            <Plus className="mr-1.5 h-4 w-4" />
                            Add Student
                        </Button>
                        <Button variant="secondary" className="!h-10 !px-4 transition-transform hover:-translate-y-0.5" onClick={() => setTeacherModalOpen(true)}>
                            <Users className="mr-1.5 h-4 w-4" />
                            Add Teacher
                        </Button>
                        <Button
                            variant="secondary"
                            className={`!h-10 !px-4 transition-all ${isExporting ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50' : ''}`}
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? <CheckCircle2 className="mr-1.5 h-4 w-4" /> : <Download className="mr-1.5 h-4 w-4" />}
                            {isExporting ? "Exported!" : "Export Data"}
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards (Compact 5-column Grid) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
                {[...topRowKpis, ...secondRowKpis].map((kpi, i) => (
                    <KpiCard key={kpi.id} kpi={kpi} index={i} />
                ))}
            </div>

            {/* Performance Overview (Interactive Chart) */}
            <SectionCard delay={0.05} bodyClassName="p-5 sm:p-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Performance Overview</h2>
                        <p className="text-sm text-[var(--text-secondary)]">Average scores vs Total tests over time</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        {realTotalTests === 0 && (
                            <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-500 font-medium">
                                No tests submitted yet
                            </span>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[var(--color-primary)]"></span>
                            <span className="text-[var(--text-secondary)]">Avg Score (%)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#ff6584]"></span>
                            <span className="text-[var(--text-secondary)]">Total Tests</span>
                        </div>
                    </div>
                </div>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ff6584" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ff6584" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '12px', boxShadow: 'var(--shadow-md)' }}
                                itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                            />
                            <Area yAxisId="left" type="monotone" dataKey="avgScore" name="Avg Score" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-primary)" }} />
                            <Area yAxisId="right" type="monotone" dataKey="tests" name="Total Tests" stroke="#ff6584" strokeWidth={3} fillOpacity={1} fill="url(#colorTests)" activeDot={{ r: 6, strokeWidth: 0, fill: "#ff6584" }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </SectionCard>

            {/* Bottom Grid: Recent Results, Leaderboard, & Activity */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">

                {/* Recent Results Table */}
                <SectionCard
                    title="Recent Results"
                    subtitle="Live test submissions"
                    className="lg:col-span-2"
                    delay={0.1}
                    bodyClassName="p-0"
                    action={
                        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                            <Input
                                placeholder="Search results…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    }
                >
                    <ResultsTable results={recentResults} onRowClick={setSelectedResult} />
                </SectionCard>

                {/* Real Test Score Leaderboard */}
                <SectionCard
                    title="Top Performers"
                    subtitle="Best test scores"
                    className="lg:col-span-1"
                    delay={0.15}
                    bodyClassName="p-0"
                >
                    <div className="flex flex-col">
                        {topStudents.length === 0 ? (
                            <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                                No student test records yet.
                            </div>
                        ) : (
                            topStudents.map((student, index) => (
                                <div key={student.id} className="group flex items-center justify-between gap-2.5 border-b border-[var(--border-subtle)] p-3.5 last:border-0 hover:bg-[var(--bg-hover)] transition-all">
                                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                        <div className="relative shrink-0">
                                            <InsigniaBadge
                                                name={student.name}
                                                email={student.email}
                                                role="STUDENT"
                                                size="sm"
                                                className="!h-9 !w-9 shrink-0 rounded-full shadow-md"
                                            />
                                            {index < 3 && (
                                                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--bg-surface)] text-[9px]">
                                                    {index === 0 ? '👑' : index + 1}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--color-primary)] transition-colors">{student.name}</p>
                                            <p className="truncate text-[11px] font-medium text-[var(--text-secondary)]">{student.standard}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-bold text-[var(--color-primary)]">{student.scoreDisplay}</p>
                                        <p className="text-[9px] font-semibold uppercase text-[var(--text-muted)]">Avg Score</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SectionCard>

                {/* Live Activity Feed from Backend Events */}
                <SectionCard
                    title="Live Activity"
                    subtitle="Real-time school events"
                    className="lg:col-span-1"
                    delay={0.2}
                    bodyClassName="p-4 sm:p-5"
                    action={<Bell className="h-4 w-4 text-[var(--color-primary)] animate-pulse" />}
                >
                    <div className="relative border-l border-[var(--border-default)] ml-3 space-y-6">
                        {recentActivities.length === 0 ? (
                            <p className="pl-4 text-xs text-[var(--text-muted)]">No recent activity.</p>
                        ) : (
                            recentActivities.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div key={activity.id} className="relative pl-6">
                                        <span className={`absolute -left-3 top-0.5 flex h-6 w-6 items-center justify-center rounded-full ${activity.bg} ${activity.color} ring-4 ring-[var(--bg-surface)]`}>
                                            <Icon className="h-3 w-3" />
                                        </span>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{activity.message}</p>
                                            <p className="flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
                                                <Clock className="h-3 w-3" />
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </SectionCard>

            </div>

            {/* Test Breakdown Modal */}
            <ResultDetailsModal
                isOpen={Boolean(selectedResult)}
                result={selectedResult}
                onClose={() => setSelectedResult(null)}
            />

            {/* Interactive Modals */}
            <UserFormModal
                isOpen={studentModalOpen}
                mode="add"
                teachers={teachers}
                schools={schoolInfo.id ? [{ id: schoolInfo.id, name: schoolInfo.name }] : []}
                assignedSchoolName={schoolInfo.name}
                isStudentForm={true}
                isSubmitting={isSubmitting}
                onClose={() => setStudentModalOpen(false)}
                onSubmit={handleAddStudent}
            />

            <TeacherFormModal
                isOpen={teacherModalOpen}
                mode="add"
                teachers={teachers}
                isSubmitting={isSubmitting}
                onClose={() => setTeacherModalOpen(false)}
                onSubmit={handleAddTeacher}
            />

            {/* Toasts */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="rounded-lg bg-gray-800 text-white px-4 py-3 shadow-lg"
                    >
                        {t.message}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
