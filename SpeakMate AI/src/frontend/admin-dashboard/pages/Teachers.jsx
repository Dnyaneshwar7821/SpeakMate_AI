import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Info,
} from "lucide-react";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";
import SectionCard from "@admin/components/SectionCard";
import { adminTeachers } from "@admin/data/adminTeachersMockData";

const STATUS_STYLES = {
    Active: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
    Inactive: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20",
};

const SCHOOL_OPTIONS = [
    "Bright Future High School",
    "St. Mary's School",
    "Delhi Public School",
];

export function Teachers() {
    const [teachersList, setTeachersList] = useState(adminTeachers);
    const [search, setSearch] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    // Form inputs state
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        schoolName: "Bright Future High School",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});

    // Cosmetic Toast notifications state
    const [toasts, setToasts] = useState([]);

    const triggerToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    // Modal Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
    });

    const triggerConfirm = (title, message, onConfirm) => {
        setConfirmDialog({
            isOpen: true,
            title,
            message,
            onConfirm,
        });
    };

    const update = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = "Teacher name is required";
        if (!form.email.trim()) next.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email";
        
        if (!form.phone.trim()) next.phone = "Phone number is required";

        if (!editingTeacher) {
            // Password fields are only required when creating a new teacher
            if (!form.password.trim()) next.password = "Password is required";
            if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
        } else {
            // In Edit Mode, only validate passwords if the user typed anything in them
            if (form.password && form.password !== form.confirmPassword) {
                next.confirmPassword = "Passwords do not match";
            }
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!validate()) return;

        if (editingTeacher) {
            // Edit Mode
            setTeachersList((prev) =>
                prev.map((t) =>
                    t.id === editingTeacher.id
                        ? {
                              ...t,
                              name: form.name,
                              email: form.email,
                              phone: form.phone,
                              schoolName: form.schoolName,
                          }
                        : t
                )
            );
            triggerToast(`Teacher "${form.name}" updated successfully!`);
        } else {
            // Add Mode
            const newTeacher = {
                id: `tch-${Date.now()}`,
                name: form.name,
                email: form.email,
                phone: form.phone,
                schoolName: form.schoolName,
                status: "Active",
            };
            setTeachersList((prev) => [newTeacher, ...prev]);
            triggerToast(`Teacher "${form.name}" added successfully!`);
        }

        setModalOpen(false);
        setEditingTeacher(null);
        setForm({
            name: "",
            email: "",
            phone: "",
            schoolName: "Bright Future High School",
            password: "",
            confirmPassword: "",
        });
        setErrors({});
    };

    const handleAddClick = () => {
        setEditingTeacher(null);
        setForm({
            name: "",
            email: "",
            phone: "",
            schoolName: "Bright Future High School",
            password: "",
            confirmPassword: "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleEditClick = (teacher) => {
        setEditingTeacher(teacher);
        setForm({
            name: teacher.name,
            email: teacher.email,
            phone: teacher.phone || "",
            schoolName: teacher.schoolName || "Bright Future High School",
            password: "",
            confirmPassword: "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleDeleteClick = (teacher) => {
        triggerConfirm(
            "Delete Teacher?",
            `Are you sure you want to permanently remove teacher "${teacher.name}" from the system? They will be unlinked from ${teacher.schoolName || "their assigned school"}.`,
            () => {
                setTeachersList((prev) => prev.filter((t) => t.id !== teacher.id));
                triggerToast(`Teacher "${teacher.name}" deleted successfully.`);
            }
        );
    };

    const handleToggleStatus = (teacher) => {
        const nextStatus = teacher.status === "Active" ? "Inactive" : "Active";
        setTeachersList((prev) =>
            prev.map((t) => (t.id === teacher.id ? { ...t, status: nextStatus } : t))
        );
        triggerToast(`Status for "${teacher.name}" changed to ${nextStatus}.`);
    };

    const filtered = teachersList.filter((t) => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
            t.name.toLowerCase().includes(q) ||
            t.email.toLowerCase().includes(q) ||
            (t.schoolName && t.schoolName.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-5 sm:space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-sm)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <UserPlus className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                            Teachers
                        </h1>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Manage teachers across all schools
                        </p>
                    </div>
                </div>
                <Button onClick={handleAddClick} className="!h-11 shrink-0">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add Teacher
                </Button>
            </motion.div>

            {/* List panel */}
            <SectionCard
                title="All Teachers"
                subtitle="Teachers registered across all educational organizations"
                delay={0.05}
                bodyClassName="p-0"
                action={
                    <div className="relative w-full sm:w-56">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                        <Input
                            placeholder="Search teachers…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="!pl-9"
                        />
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-left">
                        <thead>
                            <tr className="border-b border-[var(--border-subtle)] text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
                                <th className="px-4 py-3.5 font-semibold sm:px-5">Teacher Name</th>
                                <th className="px-4 py-3.5 font-semibold">School Name</th>
                                <th className="px-4 py-3.5 font-semibold">Email</th>
                                <th className="px-4 py-3.5 font-semibold">Phone</th>
                                <th className="px-4 py-3.5 font-semibold sm:px-5">Status</th>
                                <th className="px-4 py-3.5 text-right font-semibold sm:px-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-[var(--text-muted)]">
                                        No teachers match your search.
                                    </td>
                                </tr>
                            )}
                            {filtered.map((t) => (
                                <tr
                                    key={t.id}
                                    className="text-sm transition-colors hover:bg-[var(--bg-hover)]"
                                >
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="flex items-center gap-3">
                                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                                                {t.name
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </span>
                                            <span className="font-semibold text-[var(--text-primary)]">{t.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{t.schoolName || "—"}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{t.email}</td>
                                    <td className="px-4 py-3 text-[var(--text-secondary)]">{t.phone || "—"}</td>
                                    <td className="px-4 py-3 sm:px-5">
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(t)}
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer hover:opacity-80 transition ${
                                                STATUS_STYLES[t.status] || STATUS_STYLES["Inactive"]
                                            }`}
                                            title="Click to toggle status"
                                        >
                                            {t.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 sm:px-5">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => handleEditClick(t)}
                                                aria-label={`Edit ${t.name}`}
                                                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(t)}
                                                aria-label={`Delete ${t.name}`}
                                                className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </SectionCard>

            {/* Add / Edit Modal Dialog */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingTeacher ? "Edit Teacher Settings" : "Add Teacher Account"}
                description={editingTeacher ? "Update teacher's profile and credentials." : "Register a new teacher profile."}
            >
                <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <Input
                                label="Teacher Name"
                                placeholder="Enter Full Name"
                                value={form.name}
                                onChange={update("name")}
                                error={errors.name}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Input
                                label="Teacher Email"
                                type="email"
                                placeholder="Enter Email Address"
                                value={form.email}
                                onChange={update("email")}
                                error={errors.email}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <Input
                                label="Phone Number"
                                placeholder="e.g. +91 98765 43210"
                                value={form.phone}
                                onChange={update("phone")}
                                error={errors.phone}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <span className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                                Assigned School
                            </span>
                            <select
                                value={form.schoolName}
                                onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                                className="form-control"
                            >
                                {SCHOOL_OPTIONS.map((school) => (
                                    <option key={school} value={school}>
                                        {school}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Input
                                label={editingTeacher ? "New Password (Optional)" : "Password"}
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={update("password")}
                                error={errors.password}
                                autoComplete="new-password"
                            />
                        </div>
                        <div>
                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                value={form.confirmPassword}
                                onChange={update("confirmPassword")}
                                error={errors.confirmPassword}
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3 border-t border-[var(--border-subtle)] pt-3">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingTeacher ? "Save Changes" : "Add Teacher"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Custom Modal Confirmation Dialog */}
            <AnimatePresence>
                {confirmDialog.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
                        onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                    >
                        <motion.div
                            role="alertdialog"
                            initial={{ y: 20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 20, opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 text-rose-600 mb-3">
                                <AlertTriangle className="h-6 w-6" />
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                                    {confirmDialog.title}
                                </h3>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                {confirmDialog.message}
                            </p>
                            <div className="mt-6 flex justify-end gap-2.5">
                                <Button
                                    variant="secondary"
                                    onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                                    className="!h-10 text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        confirmDialog.onConfirm();
                                        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
                                    }}
                                    className="!h-10 text-xs"
                                >
                                    Confirm Action
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toasts Notification Overlay */}
            <div className="fixed bottom-5 right-5 z-[150] flex flex-col gap-2 max-w-sm w-full">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <motion.div
                            key={t.id}
                            role="status"
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        >
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                            <span className="font-medium">{t.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default Teachers;
