import { Edit, Trash2, UserCheck, UserX } from "lucide-react";
import InsigniaBadge from "@components/common/InsigniaBadge";

export function TeachersTable({ 
    teachers,
    isLoading, 
    onRowClick, 
    onEdit, 
    onDelete, 
    onToggleStatus,
    getStudentCount,
    filters,
    setFilters,
    departmentOptions,
    standardOptions,
    divisionOptions
}) {

    return (
        <div className="thin-scrollbar overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                    {filters && (
                        <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                            <th className="px-5 py-3"></th>
                            <th className="px-5 py-3">
                                <select
                                    value={filters.department}
                                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                                    className="form-control h-8 w-full min-w-[160px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    {departmentOptions?.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
                                </select>
                            </th>
                            <th className="px-5 py-3">
                                <div className="flex gap-2">
                                    <select
                                        value={filters.standard}
                                        onChange={(e) => setFilters(prev => ({ ...prev, standard: e.target.value }))}
                                        className="form-control h-8 w-full min-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {standardOptions?.map(s => <option key={s} value={s}>{s === 'All' ? 'All Standards' : s}</option>)}
                                    </select>
                                    <select
                                        value={filters.division}
                                        onChange={(e) => setFilters(prev => ({ ...prev, division: e.target.value }))}
                                        className="form-control h-8 w-full min-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >
                                        {divisionOptions?.map(d => <option key={d} value={d}>{d === 'All' ? 'All Divisions' : d}</option>)}
                                    </select>
                                </div>
                            </th>
                            <th className="px-5 py-3"></th>
                            <th className="px-5 py-3">
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                    className="form-control h-8 w-full min-w-[140px] rounded-md border border-slate-200 bg-white px-2 py-0 text-[13px] text-slate-700 shadow-sm focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </th>
                            <th className="px-5 py-3 text-right">
                                {Object.values(filters).some(v => v !== "All") && (
                                    <button 
                                        onClick={() => setFilters({ department: "All", standard: "All", division: "All", status: "All" })}
                                        className="text-[12px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </th>
                        </tr>
                    )}
                    <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                        <th className="px-5 py-4 w-[30%]">TEACHER</th>
                        <th className="px-5 py-4 w-[15%]">DEPARTMENT</th>
                        <th className="px-5 py-4 w-[25%]">CLASSES</th>
                        <th className="px-5 py-4 w-[15%]">ASSIGNED STUDENTS</th>
                        <th className="px-5 py-4 w-[10%]">STATUS</th>
                        <th className="px-5 py-4 w-[5%] text-right">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-primary)]">
                    {!teachers.length ? (
                        <tr>
                            <td colSpan="6" className="py-16 text-center">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">Loading teachers...</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        <p className="text-sm font-semibold text-[var(--text-primary)]">No teachers found</p>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Try adjusting your search or add a new teacher.
                                        </p>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : (
                        teachers.map((teacher) => {
                        let assignments = [];
                        if (Array.isArray(teacher.standardDivisions) && teacher.standardDivisions.length > 0) {
                            assignments = teacher.standardDivisions;
                        } else if (teacher.standard || teacher.division) {
                            assignments = [{ standard: teacher.standard, division: teacher.division }];
                        }
                        
                        const fullAssignmentsText = assignments
                            .map(sd => `${sd.standard}${sd.division ? `-${sd.division}` : ""}`)
                            .join(", ");
                            
                        const isActive = teacher.status === "active" || teacher.active;
                        
                        return (
                        <tr
                            key={teacher.id}
                            onClick={() => onRowClick && onRowClick(teacher)}
                            className="text-[13px] cursor-pointer transition-colors hover:bg-[var(--bg-hover)]"
                        >
                            <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <InsigniaBadge
                                        name={teacher.name || `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()}
                                        email={teacher.email}
                                        role="TEACHER"
                                        size="sm"
                                        className="!h-9 !w-9 shrink-0 text-xs rounded-full shadow-xs"
                                    />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-semibold text-[var(--text-primary)]">{teacher.name || teacher.firstName + " " + teacher.lastName}</span>
                                        <span className="truncate text-[12px] text-[var(--text-muted)] mt-0.5">{teacher.email}</span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-4 font-medium text-[var(--text-secondary)]">{teacher.department || "—"}</td>
                            <td className="px-5 py-4 max-w-[220px]">
                                <div className="flex flex-wrap gap-1.5">
                                    {assignments.length > 0 ? (
                                        assignments.map((sd, idx) => (
                                            <span
                                                key={`${sd.standard}-${sd.division || ""}-${idx}`}
                                                className="inline-flex items-center rounded-md bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap"
                                            >
                                                {sd.standard}{sd.division ? `-${sd.division}` : ""}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[var(--text-muted)] font-medium">—</span>
                                    )}
                                </div>
                            </td>
                            <td className="px-5 py-4">
                                <span className="inline-flex rounded-lg bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                                    {getStudentCount(teacher)}
                                </span>
                            </td>
                            <td className="px-5 py-4">
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
                            <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        aria-label={isActive ? `Deactivate ${teacher.name}` : `Activate ${teacher.name}`}
                                        onClick={() => onToggleStatus && onToggleStatus(teacher)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                    >
                                        {isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Edit ${teacher.name}`}
                                        onClick={() => onEdit(teacher)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label={`Delete ${teacher.name}`}
                                        onClick={() => onDelete(teacher)}
                                        className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                        );
                    })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default TeachersTable;
