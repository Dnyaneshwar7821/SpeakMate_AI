import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { School, ChevronDown, Filter, BookOpen, Activity, Award, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";

import SectionCard from "@admin/components/SectionCard";
import UserFormModal from "@admin/components/UserFormModal";
import DeleteUserDialog from "@admin/components/DeleteUserDialog";
import { getInitials, formatDate } from "@utils/formatters";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Realistic static data as requested.
 */
import { useAdminSchools } from "@admin/hooks/useAdminSchools";

const generateHistory = (baseScore) => {
    return [
        { name: 'W1', score: Math.max(0, baseScore - 15) },
        { name: 'W2', score: Math.max(0, baseScore - 5) },
        { name: 'W3', score: Math.min(100, baseScore + 2) },
        { name: 'W4', score: baseScore }
    ];
};

const INITIAL_USERS = [
    {
        id: "stu-1", name: "Aarav Patel", email: "aarav.p@example.com", status: "active", joinedAt: "2023-06-15", schoolName: "Green Valley High", standard: 5,
        progress: { completedLessons: 24, totalLessons: 30, percentage: 80, quizzes: 12, averageScore: 88, lastActive: "2023-10-01", history: generateHistory(88) }
    },
    {
        id: "stu-2", name: "Rohan Mehta", email: "rohan.m@example.com", status: "inactive", joinedAt: "2023-05-12", schoolName: "Green Valley High", standard: 5,
        progress: { completedLessons: 10, totalLessons: 30, percentage: 33, quizzes: 4, averageScore: 65, lastActive: "2023-08-20", history: generateHistory(65) }
    },
    {
        id: "stu-3", name: "Sara Khan", email: "sara.k@example.com", status: "active", joinedAt: "2023-07-02", schoolName: "Sunrise Public School", standard: 8,
        progress: { completedLessons: 45, totalLessons: 50, percentage: 90, quizzes: 20, averageScore: 92, lastActive: "2023-10-15", history: generateHistory(92) }
    },
    {
        id: "stu-4", name: "Liam Fernandes", email: "liam.f@example.com", status: "active", joinedAt: "2023-01-10", schoolName: "St. Mary's School", standard: 10,
        progress: { completedLessons: 60, totalLessons: 60, percentage: 100, quizzes: 30, averageScore: 95, lastActive: "2023-10-14", history: generateHistory(95) }
    },
    {
        id: "stu-5", name: "Aditi Verma", email: "aditi.v@example.com", status: "active", joinedAt: "2023-03-22", schoolName: "Oxford International School", standard: 1,
        progress: { completedLessons: 5, totalLessons: 20, percentage: 25, quizzes: 2, averageScore: 70, lastActive: "2023-09-30", history: generateHistory(70) }
    },
    {
        id: "stu-6", name: "Daniel Osei", email: "daniel.o@example.com", status: "active", joinedAt: "2023-08-11", schoolName: "Green Valley High", standard: 8,
        progress: { completedLessons: 20, totalLessons: 50, percentage: 40, quizzes: 10, averageScore: 81, lastActive: "2023-10-05", history: generateHistory(81) }
    },
    {
        id: "stu-7", name: "Priya Sharma", email: "priya.s@example.com", status: "inactive", joinedAt: "2023-02-15", schoolName: "Sunrise Public School", standard: 3,
        progress: { completedLessons: 15, totalLessons: 25, percentage: 60, quizzes: 8, averageScore: 78, lastActive: "2023-07-10", history: generateHistory(78) }
    },
    {
        id: "stu-8", name: "Ishita Rao", email: "ishita.r@example.com", status: "active", joinedAt: "2023-09-01", schoolName: "St. Mary's School", standard: 5,
        progress: { completedLessons: 8, totalLessons: 30, percentage: 26, quizzes: 4, averageScore: 85, lastActive: "2023-10-10", history: generateHistory(85) }
    },
    {
        id: "stu-9", name: "Kabir Singh", email: "kabir.s@example.com", status: "active", joinedAt: "2023-11-20", schoolName: "Oxford International School", standard: 10,
        progress: { completedLessons: 55, totalLessons: 60, percentage: 91, quizzes: 28, averageScore: 94, lastActive: "2023-11-25", history: generateHistory(94) }
    },
    {
        id: "stu-10", name: "Meera Nair", email: "meera.n@example.com", status: "active", joinedAt: "2023-10-12", schoolName: "Green Valley High", standard: 1,
        progress: { completedLessons: 18, totalLessons: 20, percentage: 90, quizzes: 5, averageScore: 96, lastActive: "2023-11-22", history: generateHistory(96) }
    },
    {
        id: "stu-11", name: "Neha Kulkarni", email: "neha.k@example.com", status: "active", joinedAt: "2023-12-05", schoolName: "Sunrise Public School", standard: 2,
        progress: { completedLessons: 12, totalLessons: 40, percentage: 30, quizzes: 6, averageScore: 72, lastActive: "2023-12-10", history: generateHistory(72) }
    },
    {
        id: "stu-12", name: "Yash Gupta", email: "yash.g@example.com", status: "active", joinedAt: "2023-09-18", schoolName: "St. Mary's School", standard: 4,
        progress: { completedLessons: 30, totalLessons: 50, percentage: 60, quizzes: 15, averageScore: 88, lastActive: "2023-10-25", history: generateHistory(88) }
    },
    {
        id: "stu-13", name: "Tanya Desai", email: "tanya.d@example.com", status: "inactive", joinedAt: "2023-04-10", schoolName: "Oxford International School", standard: 6,
        progress: { completedLessons: 2, totalLessons: 30, percentage: 6, quizzes: 1, averageScore: 50, lastActive: "2023-05-15", history: generateHistory(50) }
    },
    {
        id: "stu-14", name: "Vikram Malhotra", email: "vikram.m@example.com", status: "active", joinedAt: "2023-08-30", schoolName: "Green Valley High", standard: 7,
        progress: { completedLessons: 40, totalLessons: 60, percentage: 66, quizzes: 18, averageScore: 82, lastActive: "2023-11-01", history: generateHistory(82) }
    },
    {
        id: "stu-15", name: "Sneha Reddy", email: "sneha.r@example.com", status: "active", joinedAt: "2023-10-02", schoolName: "Sunrise Public School", standard: 9,
        progress: { completedLessons: 50, totalLessons: 70, percentage: 71, quizzes: 22, averageScore: 89, lastActive: "2023-11-20", history: generateHistory(89) }
    },
    {
        id: "stu-16", name: "Arjun Iyer", email: "arjun.i@example.com", status: "active", joinedAt: "2023-06-25", schoolName: "St. Mary's School", standard: 1,
        progress: { completedLessons: 15, totalLessons: 20, percentage: 75, quizzes: 5, averageScore: 91, lastActive: "2023-10-18", history: generateHistory(91) }
    },
    {
        id: "stu-17", name: "Kriti Sanon", email: "kriti.s@example.com", status: "active", joinedAt: "2023-07-14", schoolName: "Oxford International School", standard: 3,
        progress: { completedLessons: 22, totalLessons: 40, percentage: 55, quizzes: 10, averageScore: 76, lastActive: "2023-11-05", history: generateHistory(76) }
    },
    {
        id: "stu-18", name: "Dev Joshi", email: "dev.j@example.com", status: "inactive", joinedAt: "2023-02-28", schoolName: "Green Valley High", standard: 2,
        progress: { completedLessons: 8, totalLessons: 25, percentage: 32, quizzes: 3, averageScore: 68, lastActive: "2023-06-12", history: generateHistory(68) }
    },
    {
        id: "stu-19", name: "Ananya Pandey", email: "ananya.p@example.com", status: "active", joinedAt: "2023-09-09", schoolName: "Sunrise Public School", standard: 10,
        progress: { completedLessons: 58, totalLessons: 60, percentage: 96, quizzes: 29, averageScore: 97, lastActive: "2023-11-28", history: generateHistory(97) }
    },
    {
        id: "stu-20", name: "Rishi Kapoor", email: "rishi.k@example.com", status: "active", joinedAt: "2023-11-01", schoolName: "St. Mary's School", standard: 7,
        progress: { completedLessons: 25, totalLessons: 50, percentage: 50, quizzes: 12, averageScore: 84, lastActive: "2023-11-26", history: generateHistory(84) }
    }
];

// Custom Table to display student details and allow row clicks
function CustomUsersTable({ users, onRowClick, onEdit, onDelete }) {
    if (users.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">No students found</p>
                <p className="text-sm text-[var(--text-secondary)]">Try adjusting your filters or search query.</p>
            </div>
        );
    }

    return (
        <div className="thin-scrollbar -mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="px-4 py-3 sm:px-5">Student Name</th>
                        <th className="px-4 py-3 sm:px-5">School Name</th>
                        <th className="px-4 py-3 sm:px-5">Standard</th>
                        <th className="px-4 py-3 sm:px-5">Status</th>
                        <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr 
                            key={user.id} 
                            onClick={() => onRowClick(user)}
                            className="cursor-pointer border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--bg-hover)]"
                        >
                            <td className="px-4 py-3 sm:px-5">
                                <div className="flex items-center gap-3">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-bold text-white">
                                        {getInitials(user.name)}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-[var(--text-primary)]">{user.name}</p>
                                        <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{user.schoolName}</td>
                            <td className="px-4 py-3 sm:px-5">
                                <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                                    {getOrdinal(user.standard)} Standard
                                </span>
                            </td>
                            <td className="px-4 py-3 sm:px-5">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-[var(--text-muted)]'}`} />
                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-4 py-3 sm:px-5">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        aria-label={`Edit ${user.name}`}
                                        onClick={(e) => onEdit(e, user)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    <button
                                        type="button"
                                        aria-label={`Delete ${user.name}`}
                                        onClick={(e) => onDelete(e, user)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Custom Modal to display Student Progress
function StudentProgressModal({ isOpen, student, onClose }) {
    if (!student) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl" title="Student Progress">
            <div className="mt-6 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xl font-bold text-white shadow-md">
                        {getInitials(student.name)}
                    </span>
                    <div>
                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{student.name}</h3>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                            {student.schoolName} &bull; <span className="font-semibold">{getOrdinal(student.standard)} Standard</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                        <div className="flex items-center gap-2 text-[var(--color-primary)]">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Lessons</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{student.progress?.completedLessons || 0} <span className="text-sm font-medium text-[var(--text-muted)]">/ {student.progress?.totalLessons || 0}</span></p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Activity className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Progress</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{student.progress?.percentage || 0}%</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                        <div className="flex items-center gap-2 text-rose-500">
                            <Award className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Avg Score</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{student.progress?.averageScore || 0}%</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                        <div className="flex items-center gap-2 text-amber-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Quizzes</span>
                        </div>
                        <p className="mt-2 text-2xl font-black text-[var(--text-primary)]">{student.progress?.quizzes || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Progress Chart */}
                    <div className="flex flex-col rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">Quiz Score History</span>
                        </div>
                        <div className="h-40 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={student.progress?.history || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                                        domain={[0, 100]}
                                    />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--text-primary)' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#6c63ff" 
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#6c63ff', strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Completion Info */}
                    <div className="flex flex-col justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">Course Completion</span>
                            <span className="text-sm font-bold text-[var(--color-primary)]">{student.progress?.percentage || 0}%</span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                            <div className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-1000" style={{ width: `${student.progress?.percentage || 0}%` }} />
                        </div>
                        <div className="mt-6 flex flex-col gap-3">
                            <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <Activity className="h-4 w-4 text-emerald-500" />
                                Status: <span className="font-medium text-[var(--text-primary)] capitalize">{student.status}</span>
                            </p>
                            <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <Clock className="h-4 w-4 text-indigo-500" />
                                Last active: <span className="font-medium text-[var(--text-primary)]">{student.progress?.lastActive ? formatDate(student.progress.lastActive, { month: "short", day: "numeric", year: "numeric" }) : 'N/A'}</span>
                            </p>
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

/**
 * admin-dashboard/pages/SchoolUsers.jsx
 *
 * Super Admin Panel > School Users
 * Completely redesigned to match the clean, flat table layout of the All Users page.
 */
export function SchoolUsers() {
    const { schools, deleteSchool } = useAdminSchools();
    const [users, setUsers] = useState(INITIAL_USERS);
    
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSchool, setSelectedSchool] = useState("All Schools");
    
    // Modal State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", user: null });
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const filtered = users.filter((u) => {
            const matchesSchool = selectedSchool === "All Schools" || u.schoolName === selectedSchool;
            const matchesSearch =
                !term ||
                u.name?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.schoolName?.toLowerCase().includes(term);
            return matchesSchool && matchesSearch;
        });

        // Sort by standard ascending, then alphabetically by name
        return filtered.sort((a, b) => {
            if (a.standard !== b.standard) return a.standard - b.standard;
            return a.name.localeCompare(b.name);
        });
    }, [users, selectedSchool, searchTerm]);

    const openAddModal = () => {
        setFormModal({
            isOpen: true,
            mode: "add",
            user: { 
                userType: "school", 
                standard: 1, 
                schoolName: selectedSchool !== "All Schools" ? selectedSchool : "" 
            },
        });
    };

    const openEditModal = (e, u) => {
        e.stopPropagation();
        setFormModal({ isOpen: true, mode: "edit", user: u });
    };

    const openDeleteModal = (e, u) => {
        e.stopPropagation();
        setDeleteTarget(u);
    };

    const closeFormModal = () => setFormModal((prev) => ({ ...prev, isOpen: false }));

    const handleFormSubmit = (data) => {
        if (formModal.mode === "edit" && formModal.user) {
            setUsers((prev) => prev.map((u) => (u.id === formModal.user.id ? { ...u, ...data } : u)));
        } else {
            const newUser = {
                id: `stu-${Date.now()}`,
                status: "active",
                joinedAt: new Date().toISOString().slice(0, 10),
                progress: { completedLessons: 0, totalLessons: 30, percentage: 0, quizzes: 0, averageScore: 0, lastActive: new Date().toISOString().slice(0, 10), history: generateHistory(0) },
                ...data
            };
            setUsers((prev) => [newUser, ...prev]);
            
            // Auto-add new school to filter options if it doesn't exist
            if (data.schoolName && !schools.includes(data.schoolName)) {
                // Now handled globally, but wait we need a way to add from here too if needed?
                // For now, let's assume Add School does it. Or we can just let useAdminSchools handle it.
            }
        }
        closeFormModal();
    };

    const handleConfirmDelete = () => {
        if (!deleteTarget) return;
        setUsers((prev) => prev.filter((user) => user.id !== deleteTarget.id));
        setDeleteTarget(null);
    };

    const handleDeleteSchool = () => {
        if (selectedSchool === "All Schools") return;
        if (window.confirm(`Are you sure you want to delete the school "${selectedSchool}" and all its students? This cannot be undone.`)) {
            deleteSchool(selectedSchool);
            setUsers(prev => prev.filter(u => u.schoolName !== selectedSchool));
            setSelectedSchool("All Schools");
        }
    };

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Page header (styled similarly to AllUsers.jsx) */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <School className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            School Users
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            {users.length} registered students across all schools
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Delete School Button (Contextual) */}
                    {selectedSchool !== "All Schools" && (
                        <Button
                            variant="secondary"
                            onClick={handleDeleteSchool}
                            className="!h-11 shrink-0 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border-transparent"
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Delete School
                        </Button>
                    )}
                    <Button onClick={openAddModal} className="!h-11 shrink-0">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
            </motion.div>

            {/* Main Unified Table Section */}
            <SectionCard
                title="Registered Students"
                subtitle={selectedSchool !== "All Schools" ? `Showing students from ${selectedSchool}` : "Search, edit or remove any student"}
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        {/* School Filter Dropdown */}
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Filter className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                            <select
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="h-11 w-full min-w-[14rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-9 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                                aria-label="Filter by school"
                            >
                                <option value="All Schools">All Schools</option>
                                {schools.map(school => (
                                    <option key={school} value={school}>{school}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full sm:w-auto sm:min-w-[16rem]">
                            <Input
                                placeholder="Search students…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                }
            >
                {/* Unified Table */}
                <CustomUsersTable
                    users={filteredUsers}
                    onRowClick={setSelectedStudent}
                    onEdit={openEditModal}
                    onDelete={openDeleteModal}
                />
            </SectionCard>

            {/* Progress Modal */}
            <StudentProgressModal 
                isOpen={Boolean(selectedStudent)} 
                student={selectedStudent} 
                onClose={() => setSelectedStudent(null)} 
            />

            {/* Add/Edit Student Form */}
            <UserFormModal
                isOpen={formModal.isOpen}
                mode={formModal.mode}
                initialData={formModal.user}
                schools={schools}
                isStudentForm={true}
                onClose={closeFormModal}
                onSubmit={handleFormSubmit}
            />

            {/* Delete Confirmation */}
            <DeleteUserDialog
                isOpen={Boolean(deleteTarget)}
                user={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default SchoolUsers;
