import { Edit, Trash2 } from "lucide-react";
import Button from "@components/common/Button";

export function TeachersTable({ teachers, onRowClick, onEdit, onDelete, getStudentCount }) {
    if (!teachers.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
                <p className="text-sm font-semibold text-[var(--text-primary)]">No teachers found</p>
                <p className="text-sm text-[var(--text-secondary)]">
                    Try adjusting your search or add a new teacher.
                </p>
            </div>
        );
    }

    return (
        <div className="thin-scrollbar -mx-4 overflow-x-auto sm:mx-0">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="px-4 py-3 sm:px-5">Teacher</th>
                        <th className="px-4 py-3 sm:px-5">Subject</th>
                        <th className="px-4 py-3 sm:px-5">Assigned Students</th>
                        <th className="px-4 py-3 sm:px-5">Status</th>
                        <th className="px-4 py-3 text-right sm:px-5">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map((teacher) => (
                        <tr
                            key={teacher.id}
                            onClick={() => onRowClick && onRowClick(teacher)}
                            className="cursor-pointer border-b border-[var(--border-subtle)] transition last:border-0 hover:bg-[var(--bg-hover)]"
                        >
                            <td className="px-4 py-3 sm:px-5">
                                <div className="min-w-0">
                                    <p className="font-semibold text-[var(--text-primary)]">{teacher.name}</p>
                                    <p className="truncate text-xs text-[var(--text-secondary)]">{teacher.email}</p>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5 font-medium">{teacher.subject}</td>
                            <td className="px-4 py-3 text-[var(--text-secondary)] sm:px-5">
                                <span className="inline-flex items-center justify-center min-w-[2rem] rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-bold text-indigo-500">
                                    {getStudentCount(teacher.name)}
                                </span>
                            </td>
                            <td className="px-4 py-3 sm:px-5">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${teacher.status === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                                >
                                    {teacher.status === "active" ? "Active" : "Inactive"}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right sm:px-5">
                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        variant="secondary"
                                        className="!h-8 !w-8 !p-0"
                                        aria-label={`Edit ${teacher.name}`}
                                        onClick={() => onEdit(teacher)}
                                    >
                                        <Edit className="h-4 w-4 text-[var(--text-secondary)]" />
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        className="!h-8 !w-8 !p-0 hover:!bg-rose-500/10"
                                        aria-label={`Delete ${teacher.name}`}
                                        onClick={() => onDelete(teacher)}
                                    >
                                        <Trash2 className="h-4 w-4 text-rose-500" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TeachersTable;
