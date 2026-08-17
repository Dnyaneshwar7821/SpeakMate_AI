import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { containerVariants, itemVariants } from "@animations/variants";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import EmptyState from "@/Admin_panel/components/teacher/common/EmptyState";
import { teacherStudentsMockData } from "@/Admin_panel/data/teacherStudentsMockData";

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

const skillColumns = [
    ["Grammar", "grammar"],
    ["Vocabulary", "vocabulary"],
    ["Speaking", "speaking"],
    ["Listening", "listening"],
];

const sortableColumns = {
    name: "Student Name",
    rollNumber: "Roll Number",
    overallProgress: "Overall Progress",
};

function getInitials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("");
}

function HighlightedText({ text, query }) {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return text;

    const normalizedText = text.toLocaleLowerCase();
    const parts = [];
    let cursor = 0;
    let matchIndex = normalizedText.indexOf(normalizedQuery);

    while (matchIndex !== -1) {
        if (matchIndex > cursor) parts.push(text.slice(cursor, matchIndex));
        parts.push(
            <mark
                key={`${matchIndex}-${text.slice(matchIndex, matchIndex + normalizedQuery.length)}`}
                className="rounded bg-indigo-100 px-0.5 text-inherit"
            >
                {text.slice(matchIndex, matchIndex + normalizedQuery.length)}
            </mark>,
        );
        cursor = matchIndex + normalizedQuery.length;
        matchIndex = normalizedText.indexOf(normalizedQuery, cursor);
    }

    if (cursor < text.length) parts.push(text.slice(cursor));
    return parts;
}

function SortIndicator({ active, direction }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            className={`h-3.5 w-3.5 transition-transform ${active ? "text-indigo-600" : "text-slate-300"
                } ${active && direction === "descending" ? "rotate-180" : ""}`}
        >
            <path
                d="m4 10 4-4 4 4"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
}

function OverallProgress({ value, status, compact = false }) {
    return (
        <div className={compact ? "w-full" : "w-24"}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">{value}%</span>
            </div>
            <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Overall progress"
                aria-valuenow={value}
                aria-valuemin="0"
                aria-valuemax="100"
            >
                <div
                    className={`h-full rounded-full ${progressStyles[status]}`}
                    style={{ width: `${value}%` }}
                />
            </div>
        </div>
    );
}

function EmptyStudentsState({ isFiltered = false }) {
    return (
        <EmptyState
            title={isFiltered ? "No matching students." : "No students assigned."}
            description={
                isFiltered
                    ? "Try adjusting your search or status filter."
                    : "Assigned students will appear here when class data is available."
            }
            icon={
                <svg
                    aria-hidden="true"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m7-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87" />
                </svg>
            }
        />
    );
}

function StudentsTable({ students, onViewProfile, query, sortConfig, onSort }) {
    return (
        <Card className="hidden overflow-hidden md:block">
            <div className="max-h-[70vh] overflow-auto">
                <table className="w-full min-w-[1040px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                            {[
                                "Student Name",
                                "Roll Number",
                                "Overall Progress",
                                "Grammar",
                                "Vocabulary",
                                "Speaking",
                                "Listening",
                                "Last Active",
                                "Status",
                                "Action",
                            ].map((heading) => (
                                <th
                                    key={heading}
                                    scope="col"
                                    aria-sort={
                                        sortableColumns[sortConfig.key] === heading
                                            ? sortConfig.direction
                                            : undefined
                                    }
                                    className="sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500 first:pl-5 last:pr-5"
                                >
                                    {Object.entries(sortableColumns).find(([, label]) => label === heading) ? (
                                        <button
                                            type="button"
                                            onClick={() => onSort(
                                                Object.entries(sortableColumns).find(([, label]) => label === heading)[0],
                                            )}
                                            className="inline-flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                        >
                                            {heading}
                                            <SortIndicator
                                                active={sortableColumns[sortConfig.key] === heading}
                                                direction={sortConfig.direction}
                                            />
                                        </button>
                                    ) : heading}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {students.map((student) => (
                            <tr key={student.id} className="transition-colors duration-200 hover:bg-indigo-50/30">
                                <td className="whitespace-nowrap px-4 py-4 pl-5">
                                    <div className="flex items-center gap-3">
                                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-black text-indigo-700">
                                            {getInitials(student.name)}
                                        </span>
                                        <div>
                                            <span className="block text-sm font-bold text-slate-950">
                                                <HighlightedText text={student.name} query={query} />
                                            </span>
                                            <span className="mt-0.5 block text-[11px] font-semibold text-slate-400">
                                                Student ID: {student.id}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">
                                    <HighlightedText text={student.rollNumber} query={query} />
                                </td>
                                <td className="px-4 py-4">
                                    <OverallProgress
                                        value={student.overallProgress}
                                        status={student.status}
                                    />
                                </td>
                                {skillColumns.map(([, key]) => (
                                    <td key={key} className="px-4 py-4 text-sm font-bold text-slate-700">
                                        {student[key]}%
                                    </td>
                                ))}
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-500">
                                    {student.lastActive}
                                </td>
                                <td className="px-4 py-4">
                                    <StatusBadge status={student.status} />
                                </td>
                                <td className="px-4 py-4 pr-5">
                                    <Button
                                        variant="ghost"
                                        onClick={() => onViewProfile(student.id)}
                                        className="h-9 whitespace-nowrap px-3 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                                    >
                                        View Profile
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}

function StudentCards({ students, onViewProfile, query }) {
    return (
        <div className="grid gap-4 md:hidden">
            {students.map((student) => (
                <Card key={student.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-xs font-black text-indigo-700">
                                {getInitials(student.name)}
                            </span>
                            <div className="min-w-0">
                                <h2 className="truncate text-sm font-bold text-slate-950">
                                    <HighlightedText text={student.name} query={query} />
                                </h2>
                                <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                                    Student ID: {student.id}
                                </p>
                                <p className="mt-0.5 text-xs font-medium text-slate-500">
                                    Roll no. <HighlightedText text={student.rollNumber} query={query} />
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={student.status} />
                    </div>

                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-xs font-semibold text-slate-500">Overall Progress</span>
                            <span className="text-sm font-black text-slate-950">{student.overallProgress}%</span>
                        </div>
                        <OverallProgress
                            value={student.overallProgress}
                            status={student.status}
                            compact
                        />
                    </div>

                    <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-100 py-4">
                        {skillColumns.map(([label, key]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                                <dt className="text-xs font-medium text-slate-500">{label}</dt>
                                <dd className="text-sm font-bold text-slate-800">{student[key]}%</dd>
                            </div>
                        ))}
                    </dl>

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                Last Active
                            </p>
                            <p className="mt-1 text-xs font-semibold text-slate-600">{student.lastActive}</p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => onViewProfile(student.id)}
                            className="h-9 px-3 text-xs text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
                        >
                            View Profile
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
}

export function TeacherStudents() {
    const navigate = useNavigate();
    const { assignedStandard, students } = teacherStudentsMockData;
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All Students");
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });

    const statusFilters = useMemo(
        () => ["All Students", ...new Set(students.map((student) => student.status))],
        [students],
    );
    const visibleStudents = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
        const filteredStudents = students.filter((student) => {
            const matchesSearch = !normalizedQuery
                || student.name.toLocaleLowerCase().includes(normalizedQuery)
                || student.rollNumber.toLocaleLowerCase().includes(normalizedQuery);
            const matchesStatus = selectedStatus === "All Students" || student.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });

        return filteredStudents
            .map((student, originalIndex) => ({ student, originalIndex }))
            .sort((left, right) => {
                const leftValue = left.student[sortConfig.key];
                const rightValue = right.student[sortConfig.key];
                const comparison = typeof leftValue === "number"
                    ? leftValue - rightValue
                    : leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });

                if (comparison === 0) return left.originalIndex - right.originalIndex;
                return sortConfig.direction === "ascending" ? comparison : -comparison;
            })
            .map(({ student }) => student);
    }, [searchQuery, selectedStatus, sortConfig, students]);

    const hasActiveFilters = searchQuery.trim().length > 0 || selectedStatus !== "All Students";
    const resultSummary = visibleStudents.length === students.length && !hasActiveFilters
        ? `Showing ${students.length} students`
        : `Showing ${visibleStudents.length} of ${students.length} students`;

    const viewStudentProfile = (studentId) => navigate(`/teacher/students/${studentId}`);
    const clearFilters = () => {
        setSearchQuery("");
        setSelectedStatus("All Students");
    };
    const handleSort = (key) => {
        setSortConfig((currentSort) => ({
            key,
            direction: currentSort.key === key && currentSort.direction === "ascending"
                ? "descending"
                : "ascending",
        }));
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.header variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Teacher workspace</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                        Students
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500">
                        Review learning progress across your assigned class.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Assigned Standard</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{assignedStandard}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total Students</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{students.length}</p>
                    </div>
                </div>
            </motion.header>

            <motion.section variants={itemVariants} className="mt-8" aria-label="Student search and filters">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <label className="relative block w-full xl:max-w-sm">
                        <span className="sr-only">Search students</span>
                        <svg
                            aria-hidden="true"
                            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-3.5-3.5" />
                        </svg>
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search by student name or roll number"
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                    </label>

                    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Student filters">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setSelectedStatus(filter)}
                                aria-pressed={selectedStatus === filter}
                                className={`h-10 shrink-0 rounded-xl border px-3.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${selectedStatus === filter
                                    ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.section>

            <motion.section variants={itemVariants} className="mt-5" aria-label="Assigned students">
                <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-500" aria-live="polite">
                        {resultSummary}
                    </p>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            className="h-9 px-3 text-sm text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                            Clear
                        </Button>
                    )}
                </div>
                {visibleStudents.length === 0 ? (
                    <EmptyStudentsState isFiltered={hasActiveFilters} />
                ) : (
                    <>
                        <StudentsTable
                            students={visibleStudents}
                            onViewProfile={viewStudentProfile}
                            query={searchQuery}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                        />
                        <StudentCards
                            students={visibleStudents}
                            onViewProfile={viewStudentProfile}
                            query={searchQuery}
                        />
                    </>
                )}
            </motion.section>
        </motion.div>
    );
}

export default TeacherStudents;
