import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import InsigniaBadge from "@components/common/InsigniaBadge";

export function StudentsTable({ students, isLoading, onRowClick, onEdit, onDelete, onToggleStatus }) {
    if (!students.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                {isLoading ? (
                    <>
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Loading students...</p>
                    </>
                ) : (
                    <>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">No students found</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Try adjusting your search, or add a new student.
                        </p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="thin-scrollbar -mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="px-4 py-3 sm:px-5">Student</th>
                        <th className="px-4 py-3 sm:px-5">Standard</th>
                        <th className="px-4 py-3 sm:px-5">Assigned Teacher</th>
                        <th className="px-4 py-3 sm:px-5">Roll No.</th>
                        <th className="px-4 py-3 sm:px-5">Status</th>
                        <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => {
                        const isActive = student.status === "active";
                        return (
                        <tr
                            key={student.id}
                            onClick={() => onRowClick && onRowClick(student)}
                            className="cursor-pointer border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--bg-hover)]"
                        >
                            <td className="px-4 py-3 sm:px-5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <InsigniaBadge
                                        name={student.name}
                                        email={student.email}
                                        role="STUDENT"
                                        size="sm"
                                        className="!h-9 !w-9 shrink-0 rounded-full"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-[var(--text-primary)]">
                                            {student.name}
                                        </p>
                                        <p className="truncate text-xs text-[var(--text-secondary)]">
                                            {student.email}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{student.standard}th</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-500">
                                    {student.assignedTeacher ? (
                                        <>
                                            <InsigniaBadge name={student.assignedTeacher} role="TEACHER" size="xs" />
                                            <span>{student.assignedTeacher}</span>
                                        </>
                                    ) : (
                                        "Unassigned"
                                    )}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">{student.rollNo}</td>
                            <td className="px-4 py-3 sm:px-5">
                                <span
                                    className={[
                                        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
                                        isActive
                                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-500"
                                            : "bg-[var(--bg-subtle)] text-[var(--text-muted)] dark:bg-slate-800",
                                    ].join(" ")}
                                >
                                    <span
                                        className={[
                                            "h-1.5 w-1.5 rounded-full",
                                            isActive ? "bg-emerald-500" : "bg-[var(--text-muted)]",
                                        ].join(" ")}
                                    />
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-4 py-3 sm:px-5">
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        aria-label={isActive ? `Deactivate ${student.name}` : `Activate ${student.name}`}
                                        onClick={(e) => { e.stopPropagation(); onToggleStatus && onToggleStatus(student); }}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                    >
                                        {isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Edit ${student.name}`}
                                        onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Delete ${student.name}`}
                                        onClick={(e) => { e.stopPropagation(); onDelete(student); }}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default StudentsTable;
