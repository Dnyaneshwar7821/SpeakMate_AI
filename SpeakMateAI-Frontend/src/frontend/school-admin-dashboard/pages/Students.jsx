import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Users, Filter, ChevronDown, BookOpen, Activity, Award, CheckCircle2, Clock, Zap, Star, Download, Mic, Sparkles, Quote, Lightbulb, Stethoscope } from "lucide-react";
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
import DeleteUserDialog from "@admin/components/DeleteUserDialog";
import { useStudents, useTeachers } from "@school-admin/hooks/useSchoolData";
import { schoolAdminDataApi } from "@services/admin/schoolAdminDataApi";
import apiClient from "@services/admin/apiClient";
import { getInitials, formatDate } from "@utils/formatters";
import InsigniaBadge from "@components/common/InsigniaBadge";
import UserProgressModal from "@admin/components/UserProgressModal";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const STANDARD_OPTIONS = ["All Standards", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Uses unified UserProgressModal from @admin/components/UserProgressModal

export function Students() {
    const {
        students,
        totalStudents,
        searchTerm,
        setSearchTerm,
        standard,
        setStandard,
        addStudent,
        updateStudent,
        deleteStudent,
        isLoading
    } = useStudents();
    const { teachers } = useTeachers();
    const [assignedSchoolName, setAssignedSchoolName] = useState("Loading...");
    const [assignedSchoolId, setAssignedSchoolId] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", student: null });

    // Toast state
    const [toasts, setToasts] = useState([]);
    const triggerToast = (message, type = "success") => {
        const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    useEffect(() => {
        schoolAdminDataApi.getDashboardStats()
            .then((stats) => {
                setAssignedSchoolName(stats.schoolName || "No school assigned");
                setAssignedSchoolId(stats.schoolId || null);
            })
            .catch(() => setAssignedSchoolName("Unable to load assigned school"));
    }, []);

    const openAddModal = () => setFormModal({ isOpen: true, mode: "add", student: null });

    const handleFormSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            if (formModal.mode === "edit") {
                await updateStudent(formModal.student.id, data);
                triggerToast("Student updated successfully.");
            } else {
                const res = await addStudent(data);
                if (res?.emailSent !== false) {
                    triggerToast(`Student created successfully and login credentials have been sent to ${data.email}.`);
                } else {
                    triggerToast("Student created successfully, but the credential email could not be sent.");
                }
            }
            setFormModal({ isOpen: false, mode: "add", student: null });
        } catch (err) {
            triggerToast(err.message || "Failed to save student.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (student) => {
        try {
            const currentActive = student.active !== undefined ? Boolean(student.active) : student.status === "active";
            const nextActive = !currentActive;
            await updateStudent(student.id, {
                ...student,
                active: nextActive,
                status: nextActive ? "active" : "inactive"
            });
            triggerToast(`Student ${nextActive ? "activated" : "deactivated"} successfully.`, "success");
        } catch (error) {
            triggerToast(error.message || "Failed to update student status.", "error");
        }
    };
    const handleDelete = (student) => {
        console.log("Delete clicked for student:", student);
        setSelectedStudent(student);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedStudent?.id || isDeleting) return;
        setIsDeleting(true);
        try {
            await deleteStudent(selectedStudent.id);
            triggerToast("Student deleted successfully.");
            setShowDeleteModal(false);
            setSelectedStudent(null);
        } catch (error) {
            console.error("Failed to delete student:", error);
            triggerToast("Failed to delete student.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExport = () => {
        if (!students || !students.length) {
            alert("No student data available to export.");
            return;
        }
        const sortedStudents = [...students].sort((a, b) => {
            const rawA = a?.dbId ?? a?.id;
            const rawB = b?.dbId ?? b?.id;
            const numA = rawA !== null && rawA !== undefined && rawA !== "" && !isNaN(Number(rawA)) ? Number(rawA) : Infinity;
            const numB = rawB !== null && rawB !== undefined && rawB !== "" && !isNaN(Number(rawB)) ? Number(rawB) : Infinity;
            return numA - numB;
        });
        const headers = ["ID", "Name", "Roll No", "Email", "Standard", "Division", "Phone", "Parent Name", "Parent Phone", "Teacher"];
        const csvLines = [headers.join(",")];
        for (const s of sortedStudents) {
            const line = [
                s.id || "",
                `"${(s.name || "").replace(/"/g, '""')}"`,
                `"${(s.rollNo || "").replace(/"/g, '""')}"`,
                `"${(s.email || "").replace(/"/g, '""')}"`,
                `"${(s.standard || "").replace(/"/g, '""')}"`,
                `"${(s.division || "").replace(/"/g, '""')}"`,
                `"${(s.phone || "").replace(/"/g, '""')}"`,
                `"${(s.parentName || "").replace(/"/g, '""')}"`,
                `"${(s.parentPhone || "").replace(/"/g, '""')}"`,
                `"${(s.assignedTeacher || "").replace(/"/g, '""')}"`
            ];
            csvLines.push(line.join(","));
        }
        const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "students_export.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
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
                            {students.length} {students.length === 1 ? 'student' : 'students'} {standard !== "All Standards" ? `in ${getOrdinal(standard)} Standard` : 'across all standards'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={handleExport} className="!h-11 shrink-0">
                        <Download className="mr-1.5 h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={openAddModal} className="!h-11 shrink-0">
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add Student
                    </Button>
                </div>
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
                                value={standard}
                                onChange={(e) => setStandard(e.target.value === "All Standards" ? "All Standards" : Number(e.target.value))}
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
                    students={students}
                    isLoading={isLoading}
                    onRowClick={setViewingStudent}
                    onEdit={(s) => setFormModal({ isOpen: true, mode: "edit", student: s })}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                />
            </SectionCard>

            <UserProgressModal
                isOpen={Boolean(viewingStudent)}
                user={viewingStudent}
                student={viewingStudent}
                onClose={() => setViewingStudent(null)}
            />

            <UserFormModal
                isOpen={formModal.isOpen}
                mode={formModal.mode}
                initialData={formModal.student}
                teachers={teachers}
                schools={assignedSchoolId ? [{ id: assignedSchoolId, name: assignedSchoolName }] : []}
                assignedSchoolName={assignedSchoolName}
                isStudentForm={true}
                isSubmitting={isSubmitting}
                onClose={() => setFormModal({ isOpen: false, mode: "add", student: null })}
                onSubmit={handleFormSubmit}
            />

            <DeleteUserDialog
                isOpen={showDeleteModal}
                user={selectedStudent}
                isDeleting={isDeleting}
                onClose={() => {
                    if (!isDeleting) {
                        setShowDeleteModal(false);
                        setSelectedStudent(null);
                    }
                }}
                onConfirm={confirmDelete}
            />

            {/* Toasts */}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-xl pointer-events-auto border ${t.type === "error"
                                ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
                                : "bg-gray-900 text-white border-gray-800"
                            }`}
                    >
                        {t.message}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default Students;
