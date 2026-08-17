import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Filter, ChevronDown, BookOpen, Activity, Award, CheckCircle2, Clock, Zap, Star } from "lucide-react";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    BarChart, Bar
} from 'recharts';

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";

import SectionCard from "@school-admin/components/SectionCard";
import StudentsTable from "@school-admin/components/StudentsTable";
import UserFormModal from "@admin/components/UserFormModal";
import { useStudents, useTeachers } from "@school-admin/hooks/useSchoolData";
import { getInitials, formatDate } from "@utils/formatters";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const STANDARD_OPTIONS = ["All Standards", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Custom Modal to display Advanced Student Progress
function StudentProgressModal({ isOpen, student, onClose }) {
    if (!student) return null;

    const progress = student.progress || {};
    const xpPercent = Math.round(((progress.xp || 0) / (progress.nextLevelXp || 1)) * 100);

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" title="Student Progress Profile">
            <div className="mt-4 flex flex-col gap-6">
                
                {/* Header & XP Section */}
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
                    <div className="flex items-center gap-4">
                        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-md">
                            {getInitials(student.name)}
                        </span>
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold text-[var(--text-primary)]">{student.name}</h3>
                                {progress.batch && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-500">
                                        <Star className="h-3.5 w-3.5" />
                                        {progress.batch}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                Roll No. {student.rollNo} &bull; <span className="font-semibold">{getOrdinal(student.standard)} Standard</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex min-w-[200px] flex-col gap-2 sm:min-w-[280px]">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold text-[var(--color-primary)]">Level {progress.level || 1}</span>
                            <span className="font-medium text-[var(--text-secondary)]">
                                {progress.xp?.toLocaleString() || 0} / {progress.nextLevelXp?.toLocaleString() || 0} XP
                            </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--border-default)] shadow-inner">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000" style={{ width: `${xpPercent}%` }} />
                        </div>
                    </div>
                </div>

                {/* 4 KPI Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Lessons</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{progress.completedLessons || 0} <span className="text-sm font-medium text-[var(--text-muted)]">/ {progress.totalLessons || 0}</span></p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Activity className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Progress</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{progress.percentage || 0}%</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-rose-500">
                            <Award className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Avg Score</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{progress.averageScore || 0}%</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Quizzes</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{progress.quizzes || 0}</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    
                    {/* Skills Radar Chart */}
                    <div className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-[var(--text-primary)]">Skills Mastery</span>
                        </div>
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={progress.skills || []}>
                                    <PolarGrid stroke="var(--border-default)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Student" dataKey="score" stroke="#6c63ff" fill="#6c63ff" fillOpacity={0.3} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--color-primary)', fontWeight: 'bold' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quiz Score History Line Chart */}
                    <div className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm lg:col-span-2">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-[var(--text-primary)]">Recent Quiz Scores</span>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
                                <Zap className="h-3.5 w-3.5" />
                                Streak Active
                            </div>
                        </div>
                        <div className="h-52 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={progress.history || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} domain={[0, 100]} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Line type="monotone" dataKey="score" stroke="#ff6584" strokeWidth={3} dot={{ r: 4, fill: '#ff6584', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Weekly Activity Bar Chart */}
                    <div className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm lg:col-span-3">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-bold text-[var(--text-primary)]">Learning Hours (This Week)</span>
                            <span className="text-xs text-[var(--text-secondary)]">Last active: {progress.lastActive ? formatDate(progress.lastActive, { month: "short", day: "numeric" }) : 'N/A'}</span>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={progress.weeklyActivity || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'var(--bg-elevated)' }}
                                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-default)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Bar dataKey="hours" fill="#6c63ff" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <Button onClick={onClose} variant="secondary">Close</Button>
            </div>
        </Modal>
    );
}

export function Students() {
    const { students, totalStudents, searchTerm, setSearchTerm, addStudent, updateStudent, deleteStudent } = useStudents();
    const { teachers } = useTeachers();
    const [selectedStandard, setSelectedStandard] = useState("All Standards");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", student: null });

    // Apply Standard Filter locally in addition to the search filter from useStudents hook
    const filteredStudents = useMemo(() => {
        if (selectedStandard === "All Standards") return students;
        return students.filter(s => s.standard === selectedStandard);
    }, [students, selectedStandard]);

    const openAddModal = () => setFormModal({ isOpen: true, mode: "add", student: null });

    const handleFormSubmit = (data) => {
        if (formModal.mode === "edit") {
            updateStudent(formModal.student.id, data);
        } else {
            addStudent(data);
        }
        setFormModal({ isOpen: false, mode: "add", student: null });
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Users className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Students
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} {selectedStandard !== "All Standards" ? `in ${getOrdinal(selectedStandard)} Standard` : 'across all standards'}
                        </p>
                    </div>
                </div>
                <Button onClick={openAddModal} className="!h-11 shrink-0">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Student
                </Button>
            </motion.div>

            <SectionCard
                title="All Students"
                subtitle="Search, view and manage student records"
                delay={0.05}
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
                                placeholder="Search students…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                }
            >
                <StudentsTable 
                    students={filteredStudents} 
                    onRowClick={setSelectedStudent}
                    onEdit={(s) => setFormModal({ isOpen: true, mode: "edit", student: s })}
                    onDelete={(s) => { if (confirm(`Delete ${s.name}?`)) deleteStudent(s.id); }} 
                />
            </SectionCard>

            <StudentProgressModal 
                isOpen={Boolean(selectedStudent)} 
                student={selectedStudent} 
                onClose={() => setSelectedStudent(null)} 
            />

            <UserFormModal
                isOpen={formModal.isOpen}
                mode={formModal.mode}
                initialData={formModal.student}
                teachers={teachers}
                isStudentForm={true}
                onClose={() => setFormModal({ isOpen: false, mode: "add", student: null })}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
}

export default Students;
