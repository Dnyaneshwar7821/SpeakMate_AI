import { useMemo, useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { School, ChevronDown, Filter, BookOpen, Activity, Award, CheckCircle2, Clock, Plus, Trash2, UserCheck, UserX } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

import Button from "@components/common/Button";
import Input from "@components/common/Input";
import Modal from "@components/common/Modal";

import SectionCard from "@admin/components/SectionCard";
import UserFormModal from "@admin/components/UserFormModal";
import DeleteUserDialog from "@admin/components/DeleteUserDialog";
import SchoolSelect from "@components/common/SchoolSelect";
import InsigniaBadge from "@components/common/InsigniaBadge";
import { getInitials, formatDate } from "@utils/formatters";

import { useStudentManagement } from "@admin/hooks/useStudentManagement";
import { teacherApi } from "../../src/services/teacherApi";

/**
 * Utility to get ordinal suffixes (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Custom Table to display student details and allow row clicks
function CustomUsersTable({ users, onRowClick, onEdit, onDelete, onToggleStatus }) {
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
      <table className="w-full min-w-[850px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            <th className="px-4 py-3 sm:px-5">Student Name</th>
            <th className="px-4 py-3 sm:px-5">School Name</th>
            <th className="px-4 py-3 sm:px-5">Standard</th>
            <th className="px-4 py-3 sm:px-5">Assigned Teacher</th>
            <th className="px-4 py-3 sm:px-5">Status</th>
            <th className="px-4 py-3 text-right sm:px-5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onRowClick(user)}
              className="cursor-pointer border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--bg-hover)]"
            >
              <td className="px-4 py-3 sm:px-5">
                <div className="flex items-center gap-3">
                  <InsigniaBadge
                    name={user.name}
                    email={user.email}
                    role="STUDENT"
                    size="sm"
                  />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{user.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{user.schoolName || "N/A"}</td>
              <td className="px-4 py-3 sm:px-5">
                <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--color-primary)]">
                  {getOrdinal(user.standard)} Standard
                  {user.division ? ` (${user.division})` : ""}
                </span>
              </td>
              <td className="px-4 py-3 sm:px-5">
                {user.assignedTeacher ? (
                  <div className="flex items-center gap-2">
                    <InsigniaBadge
                      name={user.assignedTeacher}
                      role="TEACHER"
                      size="xs"
                    />
                    <span className="font-medium text-[var(--text-primary)]">{user.assignedTeacher}</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-[var(--bg-elevated)] px-2 py-0.5 text-xs text-[var(--text-muted)] italic">
                    Not Assigned
                  </span>
                )}
              </td>
              <td className="px-4 py-3 sm:px-5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.status === "active"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      user.status === "active" ? "bg-emerald-500" : "bg-[var(--text-muted)]"
                    }`}
                  />
                  {user.status === "active" ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3 sm:px-5">
                <div className="flex items-center justify-end gap-1">
                  {user.status === "active" ? (
                    <button
                      type="button"
                      title="Deactivate Student"
                      aria-label={`Deactivate ${user.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(user);
                      }}
                      className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-amber-500/10 hover:text-amber-500"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Activate Student"
                      aria-label={`Activate ${user.name}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(user);
                      }}
                      className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-emerald-500/10 hover:text-emerald-500"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    aria-label={`Edit ${user.name}`}
                    onClick={(e) => onEdit(e, user)}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    aria-label={`Delete ${user.name}`}
                    onClick={(e) => onDelete(e, user)}
                    className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16"
                      />
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
          <InsigniaBadge
            name={student.name}
            email={student.email}
            role="STUDENT"
            size="md"
            className="!h-16 !w-16 text-xl shadow-md"
          />
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">{student.name}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{student.email}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                {student.schoolName || "No School Assigned"}
              </span>
              <span className="inline-flex rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                {getOrdinal(student.standard)} Standard
              </span>
              {student.division && (
                <span className="inline-flex rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                  Division {student.division}
                </span>
              )}
              {student.rollNo && (
                <span className="inline-flex rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                  Roll No: {student.rollNo}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Lessons Completed</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {student.progress?.completedLessons || 0}
              </span>
              <span className="text-sm text-[var(--text-muted)]">/ {student.progress?.totalLessons || 50}</span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Grammar Sessions</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{student.progress?.quizzes || 0}</span>
              <span className="text-sm text-[var(--text-muted)]">sessions</span>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Avg Progress Score</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">
                {student.progress?.averageScore || 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Progress Chart */}
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <h4 className="mb-4 text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Award className="h-4 w-4 text-[var(--color-primary)]" />
              Weekly Score Performance
            </h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={student.progress?.history || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-default)",
                      borderRadius: "12px",
                      color: "var(--text-primary)"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={{ fill: "var(--color-primary)", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional details */}
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
            <h4 className="mb-4 text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[var(--color-primary)]" />
              Academic & Contact Profile
            </h4>
            <div className="space-y-4">
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Student Phone</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{student.phone || "N/A"}</span>
              </div>
              <div>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Assigned Teacher</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {student.assignedTeacher || "Not Assigned"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Parent Name</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {student.parentName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider block">Parent Phone</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {student.parentPhone || "N/A"}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[var(--text-muted)]">Course Completion Progress</span>
                  <span className="text-sm font-bold text-[var(--color-primary)]">
                    {student.progress?.percentage || 0}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-1000"
                    style={{ width: `${student.progress?.percentage || 0}%` }}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Status: <span className="font-medium text-[var(--text-primary)] capitalize">{student.status}</span>
                  </p>
                  <p className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Clock className="h-4 w-4 text-indigo-500" />
                    Last active:{" "}
                    <span className="font-medium text-[var(--text-primary)]">
                      {student.progress?.lastActive
                        ? formatDate(student.progress.lastActive, {
                            month: "short",
                            day: "numeric",
                            year: "numeric"
                          })
                        : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button onClick={onClose} variant="secondary">
          Close
        </Button>
      </div>
    </Modal>
  );
}

/**
 * admin-dashboard/pages/SchoolUsers.jsx
 *
 * Super Admin Panel > School Users
 * Completely integrated with Spring Boot School Users / Student APIs.
 */
export function SchoolUsers() {
  const {
    students,
    schools,
    schoolsLoading,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    page,
    setPage,
    size,
    setSize,
    totalPages,
    totalElements,
    filters,
    setFilters,
    addStudent,
    updateStudent,
    deleteStudent,
    activateStudent,
    deactivateStudent,
    selectedStudent,
    setSelectedStudent,
    viewStudent
  } = useStudentManagement();

  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Auto-open student progress / profile if navigated from notification
  useEffect(() => {
    const queryStudentId = searchParams.get("studentId") || searchParams.get("id");
    const targetStudentId = location.state?.viewStudentId || (queryStudentId ? Number(queryStudentId) : null);
    if (targetStudentId) {
      if (location.state?.viewStudentId) {
        window.history.replaceState({}, document.title);
      }
      viewStudent(targetStudentId)
        .then((res) => {
          if (!res) {
            triggerToast("Student record could not be loaded or was removed.", "warning");
          }
        })
        .catch(() => {
          triggerToast("Student record could not be loaded or was removed.", "warning");
        });
    }
  }, [location.state?.viewStudentId, searchParams, viewStudent]);

  // Respect ?status=active or ?status=inactive from KPI card navigation
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam === "active" || statusParam === "inactive") {
      setFilters((prev) => ({ ...prev, status: statusParam }));
      setPage(0);
    }
  }, [searchParams, setFilters, setPage]);

  // Modal State
  const [formModal, setFormModal] = useState({ isOpen: false, mode: "add", user: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Teacher state for student assignment modal
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    let cancelled = false;
    teacherApi.getTeachers()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          const mapped = data.map((t) => ({
            ...t,
            name: (`${t.firstName || ""} ${t.lastName || ""}`).trim() || t.email || "Teacher",
          }));
          setTeachers(mapped);
        }
      })
      .catch((err) => console.error("Failed to load teachers for SchoolUsers modal:", err));
    return () => { cancelled = true; };
  }, []);

  // Cosmetic Toast notifications state
  const [toasts, setToasts] = useState([]);
  const triggerToast = (message, type = "success") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const openAddModal = () => {
    setFormModal({
      isOpen: true,
      mode: "add",
      user: {
        userType: "school",
        standard: 1,
        schoolName: filters.schoolName !== "All Schools" ? filters.schoolName : (schools.length > 0 ? schools[0].name : ""),
        division: "A",
        rollNo: "",
        phone: "",
        parentName: "",
        parentPhone: "",
        status: "active"
      }
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

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (formModal.mode === "edit" && formModal.user) {
        await updateStudent(formModal.user.id, data);
        triggerToast(`Student "${data.name}" updated successfully.`);
      } else {
        const res = await addStudent(data);
        const emailSent = res?.data?.emailSent !== false && res?.emailSent !== false;
        if (emailSent) {
          triggerToast("Student created successfully and login credentials have been sent to the student's email address.");
        } else {
          triggerToast("Student created successfully, but the credential email could not be sent.");
        }
      }
      closeFormModal();
    } catch (err) {
      console.error("Failed to save student:", err);
      const errMsg = err.response?.data?.message || err.message || "An error occurred while saving the student.";
      triggerToast(errMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteTarget.id);
      triggerToast(`Student "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete student:", err);
      const errMsg = err.response?.data?.message || err.message || "An error occurred while deleting the student.";
      triggerToast(errMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      if (user.status === "active") {
        await deactivateStudent(user.id);
        triggerToast(`Student "${user.name}" deactivated successfully.`);
      } else {
        await activateStudent(user.id);
        triggerToast(`Student "${user.name}" activated successfully.`);
      }
    } catch (err) {
      console.error("Failed to toggle student status:", err);
      triggerToast("Failed to update status.");
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page header */}
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">School Users</h1>
              {isLoading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              )}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              {isLoading && (!students || students.length === 0) ? "Loading students..." : `${totalElements} registered students across all schools`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={openAddModal} className="!h-11 shrink-0">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </motion.div>

      {/* Main Unified Table Section */}
      <SectionCard
        title="Registered Students"
        subtitle={
          filters.schoolName !== "All Schools"
            ? `Showing students from ${filters.schoolName}`
            : "Search, edit or remove any student"
        }
        delay={0.05}
        bodyClassName="p-0"
        action={
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            {/* School Filter Dropdown */}
            <div className="w-full sm:w-56">
              <SchoolSelect
                value={filters.schoolName}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, schoolName: e.target.value }));
                  setPage(0);
                }}
                schools={schools}
                allowAll={true}
                allLabel="All Schools"
                placeholder="All Schools"
              />
            </div>

            {/* Standard Filter Dropdown */}
            <div className="relative">
              <select
                value={filters.standard}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, standard: e.target.value }));
                  setPage(0);
                }}
                className="h-11 w-full min-w-[9rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-3 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                aria-label="Filter by standard"
              >
                <option value="all">All Standards</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((std) => (
                  <option key={std} value={std}>
                    {std} Standard
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Division Filter Dropdown */}
            <div className="relative">
              <select
                value={filters.division}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, division: e.target.value }));
                  setPage(0);
                }}
                className="h-11 w-full min-w-[8rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-3 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                aria-label="Filter by division"
              >
                <option value="all">All Divisions</option>
                {["A", "B", "C", "D"].map((div) => (
                  <option key={div} value={div}>
                    Division {div}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters((prev) => ({ ...prev, status: e.target.value }));
                  setPage(0);
                }}
                className="h-11 w-full min-w-[9rem] appearance-none rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] pl-3 pr-10 text-sm font-medium text-[var(--text-primary)] outline-none transition focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 sm:w-auto"
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-auto sm:min-w-[14rem]">
              <Input placeholder="Search students…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        }
      >
        {isLoading && (!students || students.length === 0) ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500 shadow-sm" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">Loading students...</p>
              <p className="text-xs text-[var(--text-secondary)]">Please wait while student records are being fetched.</p>
            </div>
          </div>
        ) : error && (!students || students.length === 0) ? (
          <div className="py-20 text-center text-sm text-red-500 font-semibold">{error}</div>
        ) : (
          <CustomUsersTable
            users={students}
            onRowClick={(user) => viewStudent(user.id)}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            onToggleStatus={handleToggleStatus}
          />
        )}

        {/* Pagination Footer */}
        {!isLoading && !error && totalElements > 0 && (
          <div className="border-t border-[var(--border-subtle)] px-4 py-4 sm:px-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-[var(--text-secondary)]">
              Showing <span className="font-semibold">{Math.min(totalElements, page * size + 1)}</span> to{" "}
              <span className="font-semibold">{Math.min(totalElements, (page + 1) * size)}</span> of{" "}
              <span className="font-semibold">{totalElements}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="!h-9 !px-3 text-xs"
              >
                Previous
              </Button>
              <span className="text-xs font-medium text-[var(--text-primary)] px-2">
                Page {page + 1} of {Math.max(1, totalPages)}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="!h-9 !px-3 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
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
        teachers={teachers}
        isStudentForm={true}
        isSubmitting={isSubmitting}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
      />

      {/* Delete Confirmation */}
      <DeleteUserDialog
        isOpen={Boolean(deleteTarget)}
        user={deleteTarget}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Toasts Notification Overlay */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, filter: "blur(8px)" }}
              className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-xl pointer-events-auto border ${
                t.type === "error"
                  ? "bg-rose-50 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
                  : "bg-slate-900 text-white border-slate-800 dark:bg-slate-800 dark:border-slate-700"
              }`}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SchoolUsers;
