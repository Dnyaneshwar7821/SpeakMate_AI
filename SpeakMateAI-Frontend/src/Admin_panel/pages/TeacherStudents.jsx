import { motion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "@/Admin_panel/context/ThemeContext";
import { containerVariants, itemVariants } from "@animations/variants";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import EmptyState from "@/Admin_panel/components/teacher/common/EmptyState";
import { teacherDataApi } from "@services/admin/teacherDataApi";

const statusStyles = {
    Excellent: "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/20",
    Good: "bg-indigo-50 text-indigo-700 ring-indigo-600/10 dark:bg-indigo-500/15 dark:text-indigo-400 dark:ring-indigo-500/20",
    Average: "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/20",
    "Needs Attention": "bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-500/15 dark:text-rose-400 dark:ring-rose-500/20",
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
    class: "Class",
    division: "Division",
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
    const clampedValue = Math.min(100, Math.max(0, Math.round(Number(value) || 0)));
    return (
        <div className={compact ? "w-full" : "w-24"}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">{clampedValue}%</span>
            </div>
            <div
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-label="Overall progress"
                aria-valuenow={clampedValue}
                aria-valuemin="0"
                aria-valuemax="100"
            >
                <div
                    className={`h-full rounded-full ${progressStyles[status] || progressStyles.Good}`}
                    style={{ width: `${clampedValue}%` }}
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
                    ? "Try adjusting your search, standard, or grade filter."
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
                                "Class",
                                "Division",
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
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600">
                                    {student.standard}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600">
                                    {student.division || "-"}
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

function StudentsTableSkeleton() {
    return (
        <Card className="overflow-hidden">
            <div className="max-h-[70vh] overflow-auto">
                <table className="w-full min-w-[1040px] border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80">
                            {[
                                "Student Name", "Class", "Division", "Roll Number", "Overall Progress",
                                "Grammar", "Vocabulary", "Speaking", "Listening", "Last Active", "Status", "Action"
                            ].map((h) => (
                                <th key={h} className="bg-slate-50 px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-400 first:pl-5 last:pr-5">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="whitespace-nowrap px-4 py-4 pl-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700" />
                                        <div className="space-y-1.5">
                                            <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                                            <div className="h-2.5 w-16 rounded bg-slate-100 dark:bg-slate-800" />
                                        </div>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4"><div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="whitespace-nowrap px-4 py-4"><div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="whitespace-nowrap px-4 py-4"><div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4"><div className="h-2.5 w-24 rounded-full bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4"><div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="whitespace-nowrap px-4 py-4"><div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4"><div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-700" /></td>
                                <td className="px-4 py-4 pr-5"><div className="h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" /></td>
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
                                    ID: {student.id} &bull; Class: {student.standard} {student.division ? `- ${student.division}` : ''}
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

function calculateStudentCategory(overallProgress, rawStatus) {
    if (rawStatus === "INACTIVE" || rawStatus === "Inactive") return "Needs Attention";
    const prog = Number(overallProgress) || 0;
    if (prog >= 90) return "Excellent";
    if (prog >= 80) return "Good";
    if (prog >= 70) return "Average";
    return "Needs Attention";
}

function formatLastActiveTime(timestamp) {
    if (!timestamp) return "Recently";
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "Recently";
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch (e) {
        return "Recently";
    }
}

export function TeacherStudents() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const paramStandard = searchParams.get("standard");
    const paramDivision = searchParams.get("division");

    const { accent } = useTheme();
    const [assignedStandard, setAssignedStandard] = useState("Assigned Standard");
    const [assignedStandards, setAssignedStandards] = useState([]);
    const [assignedDivisions, setAssignedDivisions] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState(paramStandard || "All Standards");
    const [selectedDivision, setSelectedDivision] = useState(paramDivision || "All Divisions");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGrade, setSelectedGrade] = useState("All Grades");
    const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" });

    useEffect(() => {
        const fetchStudentsData = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await teacherDataApi.getStudents(searchQuery, "", selectedStandard, selectedDivision);

                // Set Assigned Standards from backend (canonical source: assigned ClassRoom grades / standards)
                const assignedStandardsFromApi = Array.isArray(res?.assignedStandards)
                    ? [...new Set(res.assignedStandards.filter((std) => std && String(std).trim() !== ""))]
                    : [];
                const assignedDivisionsFromApi = Array.isArray(res?.assignedDivisions)
                    ? [...new Set(res.assignedDivisions.filter((div) => div && String(div).trim() !== ""))]
                    : [];

                if (assignedStandardsFromApi.length > 0) {
                    setAssignedStandards(assignedStandardsFromApi);
                    setAssignedStandard(assignedStandardsFromApi.join(", "));
                } else if (res?.assignedClasses && Array.isArray(res.assignedClasses) && res.assignedClasses.length > 0) {
                    const fallbackStandards = [...new Set(
                        res.assignedClasses
                            .map((c) => (c && (c.grade || c.standard || c.name)) || "")
                            .filter((std) => String(std).trim() !== ""),
                    )];
                    setAssignedStandards(fallbackStandards);
                    setAssignedStandard(fallbackStandards.join(", ") || "No Standard Assigned");
                } else {
                    setAssignedStandards([]);
                    setAssignedStandard("No Standard Assigned");
                }

                if (assignedDivisionsFromApi.length > 0) {
                    setAssignedDivisions(assignedDivisionsFromApi);
                } else if (res?.assignedClasses && Array.isArray(res.assignedClasses)) {
                    const fallbackDivs = [...new Set(
                        res.assignedClasses
                            .map((c) => c && c.division)
                            .filter((div) => div && String(div).trim() !== "")
                    )];
                    if (fallbackDivs.length > 0) {
                        setAssignedDivisions(fallbackDivs);
                    }
                }

                // Guard: if the selected standard is no longer assigned, reset to All Standards
                if (selectedStandard !== "All Standards" && assignedStandardsFromApi.length > 0 && !assignedStandardsFromApi.includes(selectedStandard)) {
                    // keep paramStandard if provided, else reset
                    if (!paramStandard) setSelectedStandard("All Standards");
                }

                // Extract students list safely
                const rawList = res?.students || res?.content || (Array.isArray(res) ? res : []);
                if (Array.isArray(rawList)) {
                    const mapped = rawList.map((s, idx) => {
                        const fullName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || `Student ${idx + 1}`;
                        const progressVal = Math.round(s.overallProgress ?? s.progress ?? 0);
                        const categoryStatus = calculateStudentCategory(progressVal, s.status);

                        return {
                            id: s.id || s.studentId || `STU-${String(idx + 1).padStart(4, '0')}`,
                            studentId: s.studentId || s.id || `STU-${String(idx + 1).padStart(4, '0')}`,
                            name: fullName,
                            rollNumber: s.rollNumber || `05-${String(idx + 1).padStart(2, '0')}`,
                            overallProgress: progressVal,
                            grammar: Math.round(s.grammarScore ?? 0),
                            vocabulary: Math.round(s.vocabularyScore ?? 0),
                            speaking: Math.round(s.speakingScore ?? 0),
                            listening: Math.round(s.listeningScore ?? 0),
                            lastActive: formatLastActiveTime(s.lastActive || s.updatedAt),
                            status: categoryStatus,
                            standard: s.standard || "",
                            division: s.division || ""
                        };
                    });
                    setStudents(mapped);
                } else {
                    setStudents([]);
                }
            } catch (err) {
                console.error("Failed to load teacher students API:", err);
                setError("Failed to fetch students data from server.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudentsData();
    }, [searchQuery, selectedStandard, selectedDivision]);

    const gradeFilters = useMemo(
        () => ["All Grades", "Excellent", "Good", "Average", "Needs Attention"],
        [],
    );

    const visibleStudents = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
        const filteredStudents = students.filter((student) => {
            const matchesSearch = !normalizedQuery
                || (student.name && student.name.toLocaleLowerCase().includes(normalizedQuery))
                || (student.rollNumber && student.rollNumber.toLocaleLowerCase().includes(normalizedQuery));
            const matchesGrade = selectedGrade === "All Grades" || student.status === selectedGrade;
            const matchesDivision = selectedDivision === "All Divisions" 
                || (student.division && student.division.trim().toUpperCase() === selectedDivision.trim().toUpperCase());
            return matchesSearch && matchesGrade && matchesDivision;
        });

        return filteredStudents
            .map((student, originalIndex) => ({ student, originalIndex }))
            .sort((left, right) => {
                const leftValue = left.student[sortConfig.key] ?? "";
                const rightValue = right.student[sortConfig.key] ?? "";
                const comparison = typeof leftValue === "number"
                    ? leftValue - rightValue
                    : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: "base" });

                if (comparison === 0) return left.originalIndex - right.originalIndex;
                return sortConfig.direction === "ascending" ? comparison : -comparison;
            })
            .map(({ student }) => student);
    }, [searchQuery, selectedGrade, selectedDivision, sortConfig, students]);

    const hasActiveFilters = searchQuery.trim().length > 0 || selectedGrade !== "All Grades" || selectedStandard !== "All Standards" || selectedDivision !== "All Divisions";
    const resultSummary = visibleStudents.length === students.length && !hasActiveFilters
        ? `Showing ${students.length} students`
        : `Showing ${visibleStudents.length} of ${students.length} students`;

    const viewStudentProfile = (studentId) => navigate(`/teacher/students/${studentId}`);
    const clearFilters = () => {
        setSearchQuery("");
        setSelectedGrade("All Grades");
        setSelectedStandard("All Standards");
        setSelectedDivision("All Divisions");
    };
    const handleSort = (key) => {
        setSortConfig((currentSort) => ({
            key,
            direction: currentSort.key === key && currentSort.direction === "ascending"
                ? "descending"
                : "ascending",
        }));
    };

    const displayStandard = selectedStandard === "All Standards" ? assignedStandard : selectedStandard;
    const displayCount = visibleStudents.length;

    const cardBgStyles = {
        purple: "bg-purple-50 border border-purple-200 dark:bg-purple-900/20 dark:border-purple-500/20",
        indigo: "bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-500/20",
        rose: "bg-rose-50 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-500/20",
        blue: "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/20",
        emerald: "bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/20",
        amber: "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-500/20"
    };

    const textStyles = {
        purple: "text-purple-600 dark:text-purple-400",
        indigo: "text-indigo-600 dark:text-indigo-400",
        rose: "text-rose-600 dark:text-rose-400",
        blue: "text-blue-600 dark:text-blue-400",
        emerald: "text-emerald-600 dark:text-emerald-400",
        amber: "text-amber-600 dark:text-amber-400"
    };

    const valueStyles = {
        purple: "text-purple-900 dark:text-purple-50",
        indigo: "text-indigo-900 dark:text-indigo-50",
        rose: "text-rose-900 dark:text-rose-50",
        blue: "text-blue-900 dark:text-blue-50",
        emerald: "text-emerald-900 dark:text-emerald-50",
        amber: "text-amber-900 dark:text-amber-50"
    };

    const activeBg = cardBgStyles[accent] || cardBgStyles.blue;
    const activeText = textStyles[accent] || textStyles.blue;
    const activeValue = valueStyles[accent] || valueStyles.blue;

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.header variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Teacher workspace</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                        Students
                    </h1>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Review learning progress across your assigned standard.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                    <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`relative overflow-hidden rounded-2xl ${activeBg} px-5 py-3.5 shadow-sm sm:min-w-[200px]`}
                    >
                        <p className={`relative z-10 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${activeText}`}>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Assigned Standard
                        </p>
                        <p className={`relative z-10 mt-1.5 text-2xl font-black ${activeValue}`}>
                            {displayStandard}
                        </p>
                    </motion.div>

                    <motion.div 
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white/80 px-5 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/80 sm:min-w-[140px]"
                    >
                        <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Total Students
                        </p>
                        <p className="mt-1.5 text-2xl font-black text-slate-800 dark:text-slate-100">
                            {displayCount}
                        </p>
                    </motion.div>
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
                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-950/50"
                        />
                    </label>

                    <label className="relative block w-full shrink-0 xl:w-64">
                        <span className="sr-only">Filter students by assigned standard</span>
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-slate-400">
                            Standard
                        </span>
                        <select
                            value={selectedStandard}
                            onChange={(event) => setSelectedStandard(event.target.value)}
                            aria-label="Filter students by assigned standard"
                            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-24 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950/50"
                        >
                            <option value="All Standards">All Standards</option>
                            {assignedStandards.map((standard) => (
                                <option key={standard} value={standard}>
                                    {standard}
                                </option>
                            ))}
                        </select>
                        <svg
                            aria-hidden="true"
                            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </label>

                    {assignedDivisions.length > 0 && (
                        <label className="relative block w-full shrink-0 xl:w-56">
                            <span className="sr-only">Filter students by division</span>
                            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-slate-400">
                                Division
                            </span>
                            <select
                                value={selectedDivision}
                                onChange={(event) => setSelectedDivision(event.target.value)}
                                aria-label="Filter students by division"
                                className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-20 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950/50"
                            >
                                <option value="All Divisions">All Divisions</option>
                                {assignedDivisions.map((division) => (
                                    <option key={division} value={division}>
                                        Division {division}
                                    </option>
                                ))}
                            </select>
                            <svg
                                aria-hidden="true"
                                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </label>
                    )}

                    <label className="relative block w-full shrink-0 xl:w-64">
                        <span className="sr-only">Filter students by grade</span>
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-slate-400">
                            Grade
                        </span>
                        <select
                            value={selectedGrade}
                            onChange={(event) => setSelectedGrade(event.target.value)}
                            aria-label="Filter students by grade"
                            className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-16 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-indigo-950/50"
                        >
                            {gradeFilters.map((grade) => (
                                <option key={grade} value={grade}>
                                    {grade}
                                </option>
                            ))}
                        </select>
                        <svg
                            aria-hidden="true"
                            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </label>
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

                {loading ? (
                    <StudentsTableSkeleton />
                ) : error ? (
                    <div className="mt-8 text-center text-sm font-medium text-rose-500">
                        {error}
                    </div>
                ) : visibleStudents.length === 0 ? (
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
