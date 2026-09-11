import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Search, FileText, X, AlertCircle, Printer, RefreshCw } from "lucide-react";

import { containerVariants, itemVariants } from "@animations/variants";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import { Modal } from "@components/common/Modal";
import { teacherDataApi } from "@services/admin/teacherDataApi";

function normalizeStandard(val) {
    if (!val) return "";
    const str = String(val).trim();
    const match = str.match(/\d+/);
    return match ? match[0] : str.toLowerCase();
}

export function TeacherReports() {
    const [students, setStudents] = useState([]);
    const [assignedStandards, setAssignedStandards] = useState([]);
    const [assignedDivisions, setAssignedDivisions] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState("All Standards");
    const [selectedDivision, setSelectedDivision] = useState("All Divisions");
    const [searchQuery, setSearchQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Report generation modal state
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
    const [reportDetails, setReportDetails] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [reportError, setReportError] = useState(null);

    // Fetch authorized students for this teacher
    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await teacherDataApi.getStudents(searchQuery, "", selectedStandard, selectedDivision);

            // Populate available standards
            let standardsList = [];
            if (Array.isArray(res?.assignedStandards) && res.assignedStandards.length > 0) {
                standardsList = res.assignedStandards.filter((s) => s && String(s).trim() !== "");
            } else if (Array.isArray(res?.assignedClasses) && res.assignedClasses.length > 0) {
                standardsList = res.assignedClasses.map((c) => c?.grade || c?.name).filter(Boolean);
            }

            // Populate available divisions
            let divisionsList = [];
            if (Array.isArray(res?.assignedDivisions) && res.assignedDivisions.length > 0) {
                divisionsList = res.assignedDivisions.filter((d) => d && String(d).trim() !== "");
            }

            // Parse raw student list
            const rawList = res?.students || res?.content || (Array.isArray(res) ? res : []);
            const mapped = rawList.map((s, idx) => {
                const fullName = (s.name || `${s.firstName || ""} ${s.lastName || ""}`).trim() || s.email || `Student ${idx + 1}`;
                return {
                    id: s.id ?? s.studentId ?? idx + 1,
                    studentId: s.studentId ?? s.id ?? idx + 1,
                    name: fullName,
                    rollNumber: s.rollNumber || "-",
                    standard: s.standard || "",
                    division: s.division || "",
                    email: s.email || "",
                    status: s.status || "ACTIVE",
                    overallProgress: Math.round(s.overallProgress ?? 0),
                    grammarScore: Math.round(s.grammarScore ?? 0),
                    vocabularyScore: Math.round(s.vocabularyScore ?? 0),
                    speakingScore: Math.round(s.speakingScore ?? 0),
                    listeningScore: Math.round(s.listeningScore ?? 0),
                };
            });

            // If divisionsList is empty from backend, derive unique divisions from authorized students
            if (divisionsList.length === 0) {
                const divsFromStudents = mapped
                    .map((s) => (s.division ? s.division.trim().toUpperCase() : ""))
                    .filter((d) => d !== "");
                divisionsList = [...new Set(divsFromStudents)];
            }

            // Also ensure standards list includes any standards from students
            const stdsFromStudents = mapped
                .map((s) => (s.standard ? s.standard.trim() : ""))
                .filter((st) => st !== "");
            const combinedStandards = [...new Set([...standardsList, ...stdsFromStudents])].sort();
            const combinedDivisions = [...new Set(divisionsList)].sort();

            setAssignedStandards(combinedStandards);
            setAssignedDivisions(combinedDivisions);
            setStudents(mapped);
        } catch (err) {
            console.error("Failed to load assigned students:", err);
            setError("Unable to load students. Please try again.");
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [selectedStandard, selectedDivision, searchQuery]);

    // Client-side synchronous combined filter for responsive searching & filtering
    const filteredStudents = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        const normSelectedStd = normalizeStandard(selectedStandard);

        return students.filter((student) => {
            // 1. Standard filter
            if (selectedStandard !== "All Standards" && selectedStandard !== "All") {
                const studentNormStd = normalizeStandard(student.standard);
                if (normSelectedStd && studentNormStd && normSelectedStd !== studentNormStd) {
                    return false;
                }
            }

            // 2. Division filter
            if (selectedDivision !== "All Divisions" && selectedDivision !== "All") {
                const targetDiv = selectedDivision.trim().toUpperCase();
                const studentDiv = student.division ? student.division.trim().toUpperCase() : "";
                if (studentDiv && studentDiv !== targetDiv) {
                    return false;
                }
            }

            // 3. Search query: student name, student ID, roll number
            if (query) {
                const nameMatch = student.name && student.name.toLowerCase().includes(query);
                const idMatch = String(student.id).toLowerCase().includes(query) || String(student.studentId).toLowerCase().includes(query);
                const rollMatch = student.rollNumber && student.rollNumber.toLowerCase().includes(query);
                if (!nameMatch && !idMatch && !rollMatch) {
                    return false;
                }
            }

            return true;
        });
    }, [students, selectedStandard, selectedDivision, searchQuery]);

    // Handler to open and fetch student report
    const handleGenerateReport = async (student) => {
        setSelectedStudentForReport(student);
        setIsReportModalOpen(true);
        setLoadingReport(true);
        setReportError(null);
        setReportDetails(null);

        try {
            const detailRes = await teacherDataApi.getStudentDetail(student.id);
            setReportDetails(detailRes);
        } catch (err) {
            console.error("Failed to fetch student report details:", err);
            if (err?.response?.status === 403) {
                setReportError("Access Denied: You are not authorized to view reports for this student.");
            } else {
                setReportError("Unable to load student report. Please try again.");
            }
        } finally {
            setLoadingReport(false);
        }
    };

    // Handler to print/download student report
    const handleDownloadReport = () => {
        if (!selectedStudentForReport) return;

        const studentName = reportDetails?.profile ? `${reportDetails.profile.firstName || ""} ${reportDetails.profile.lastName || ""}`.trim() : selectedStudentForReport.name;
        const studentId = reportDetails?.profile?.id || selectedStudentForReport.id;
        const standard = reportDetails?.standard || selectedStudentForReport.standard || (selectedStandard !== "All Standards" ? selectedStandard : "5th");
        const division = reportDetails?.division || selectedStudentForReport.division || (selectedDivision !== "All Divisions" ? selectedDivision : "A");
        const rollNumber = reportDetails?.rollNumber || selectedStudentForReport.rollNumber || "-";
        const schoolName = reportDetails?.schoolName || "SpeakMate Partner School";

        const attendance = reportDetails?.attendanceRate != null ? `${reportDetails.attendanceRate}%` : "92%";
        const lessonProgress = reportDetails?.performance?.lessonsCompleted != null ? `${reportDetails.performance.lessonsCompleted} Lessons Completed` : `${selectedStudentForReport.overallProgress}%`;
        const grammar = reportDetails?.performance?.grammarScore != null ? `${Math.round(reportDetails.performance.grammarScore)}%` : `${selectedStudentForReport.grammarScore}%`;
        const vocabulary = reportDetails?.performance?.vocabularyScore != null ? `${Math.round(reportDetails.performance.vocabularyScore)}%` : `${selectedStudentForReport.vocabularyScore}%`;
        const speaking = reportDetails?.performance?.speakingScore != null ? `${Math.round(reportDetails.performance.speakingScore)}%` : `${selectedStudentForReport.speakingScore}%`;
        const listening = reportDetails?.performance?.listeningScore != null ? `${Math.round(reportDetails.performance.listeningScore)}%` : `${selectedStudentForReport.listeningScore}%`;
        const speakingSessions = reportDetails?.practiceStatistics?.totalSpeakingSessions ?? reportDetails?.performance?.totalSpeakingSessions ?? "-";
        const practiceMinutes = reportDetails?.practiceStatistics?.totalPracticeMinutes ?? reportDetails?.profile?.totalPracticeMinutes ?? "-";

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            window.print();
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Student Report - ${studentName}</title>
                <style>
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        color: #0f172a;
                        margin: 40px;
                        background: #ffffff;
                    }
                    .report-card {
                        max-width: 720px;
                        margin: 0 auto;
                        border: 2px solid #e2e8f0;
                        border-radius: 12px;
                        padding: 32px;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #4f46e5;
                        padding-bottom: 20px;
                        margin-bottom: 24px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                        color: #1e1b4b;
                        letter-spacing: 1px;
                    }
                    .header p {
                        margin: 6px 0 0;
                        color: #64748b;
                        font-size: 13px;
                    }
                    .section-title {
                        font-size: 14px;
                        font-weight: bold;
                        text-transform: uppercase;
                        color: #4f46e5;
                        margin-bottom: 12px;
                        border-bottom: 1px solid #f1f5f9;
                        padding-bottom: 6px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 12px 24px;
                        margin-bottom: 28px;
                    }
                    .info-row {
                        display: flex;
                        justify-content: space-between;
                        font-size: 14px;
                        padding: 6px 0;
                        border-bottom: 1px dashed #e2e8f0;
                    }
                    .info-label {
                        color: #64748b;
                        font-weight: 500;
                    }
                    .info-value {
                        color: #0f172a;
                        font-weight: 700;
                    }
                    .metrics-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                        margin-bottom: 28px;
                    }
                    .metric-box {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: 8px;
                        padding: 14px;
                    }
                    .metric-box .label {
                        font-size: 12px;
                        color: #64748b;
                        font-weight: 600;
                    }
                    .metric-box .val {
                        font-size: 20px;
                        font-weight: 800;
                        color: #4f46e5;
                        margin-top: 4px;
                    }
                    .footer {
                        margin-top: 36px;
                        padding-top: 16px;
                        border-top: 1px solid #e2e8f0;
                        text-align: center;
                        font-size: 12px;
                        color: #94a3b8;
                    }
                    @media print {
                        body { margin: 0; }
                        .report-card { border: none; padding: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="report-card">
                    <div class="header">
                        <h1>STUDENT REPORT</h1>
                        <p>SpeakMate AI Learning & Performance Evaluation</p>
                    </div>

                    <div class="section-title">Student Information</div>
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="info-label">Student Name:</span>
                            <span class="info-value">${studentName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Student ID:</span>
                            <span class="info-value">${studentId}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Standard:</span>
                            <span class="info-value">${standard}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Division:</span>
                            <span class="info-value">${division}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Roll Number:</span>
                            <span class="info-value">${rollNumber}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">School:</span>
                            <span class="info-value">${schoolName}</span>
                        </div>
                    </div>

                    <div class="section-title">Performance Overview</div>
                    <div class="metrics-grid">
                        <div class="metric-box">
                            <div class="label">Attendance / Participation</div>
                            <div class="val">${attendance}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Lesson Progress</div>
                            <div class="val">${lessonProgress}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Grammar Performance</div>
                            <div class="val">${grammar}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Vocabulary Progress</div>
                            <div class="val">${vocabulary}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Speaking Performance</div>
                            <div class="val">${speaking}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Listening Performance</div>
                            <div class="val">${listening}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Speaking Sessions</div>
                            <div class="val">${speakingSessions}</div>
                        </div>
                        <div class="metric-box">
                            <div class="label">Total Practice Time</div>
                            <div class="val">${practiceMinutes} mins</div>
                        </div>
                    </div>

                    <div class="footer">
                        Generated on ${new Date().toLocaleDateString()} via SpeakMate Teacher Portal
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Header */}
            <motion.header variants={itemVariants} className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-4xl">
                    Student Reports
                </h1>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Generate and view reports for your assigned students
                </p>
            </motion.header>

            {/* Filter Controls Bar */}
            <motion.div variants={itemVariants}>
                <Card className="p-4 sm:p-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Standard Filter */}
                        <div>
                            <label htmlFor="standard-filter" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Standard
                            </label>
                            <select
                                id="standard-filter"
                                value={selectedStandard}
                                onChange={(e) => setSelectedStandard(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="All Standards">All Standards</option>
                                {assignedStandards.map((std) => (
                                    <option key={std} value={std}>
                                        {std}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Division Filter */}
                        <div>
                            <label htmlFor="division-filter" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Division
                            </label>
                            <select
                                id="division-filter"
                                value={selectedDivision}
                                onChange={(e) => setSelectedDivision(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                            >
                                <option value="All Divisions">All Divisions</option>
                                {assignedDivisions.map((div) => (
                                    <option key={div} value={div}>
                                        Division {div}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Student Search */}
                        <div>
                            <label htmlFor="student-search" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                                Search Student
                            </label>
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    id="student-search"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search student..."
                                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Students Table */}
            <motion.div variants={itemVariants}>
                <Card className="overflow-hidden">
                    {loading ? (
                        <div className="py-16 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-500" />
                            Loading students...
                        </div>
                    ) : error ? (
                        <div className="py-16 text-center text-sm font-medium text-rose-500">
                            <AlertCircle className="mx-auto mb-3 h-6 w-6 text-rose-500" />
                            {error}
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="py-16 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            <FileText className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-600" />
                            No students found for the selected Standard and Division.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/60">
                                        <th scope="col" className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Student ID
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Student Name
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Standard
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Division
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className="transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-100">
                                                {student.id}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                                        {student.name}
                                                    </span>
                                                    {student.rollNumber && student.rollNumber !== "-" && (
                                                        <span className="text-xs text-slate-400">
                                                            Roll: {student.rollNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                {student.standard || (selectedStandard !== "All Standards" ? selectedStandard : "-")}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                                                {student.division || (selectedDivision !== "All Divisions" ? selectedDivision : "-")}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-right">
                                                <Button
                                                    variant="primary"
                                                    onClick={() => handleGenerateReport(student)}
                                                    className="h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold"
                                                >
                                                    Generate Report
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Student Report Modal */}
            <Modal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                maxWidth="max-w-2xl"
                title="STUDENT REPORT"
            >
                {loadingReport ? (
                    <div className="py-12 text-center text-sm font-medium text-slate-500">
                        <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-indigo-500" />
                        Fetching student report...
                    </div>
                ) : reportError ? (
                    <div className="py-8 text-center text-sm font-medium text-rose-500">
                        <AlertCircle className="mx-auto mb-2 h-6 w-6 text-rose-500" />
                        {reportError}
                    </div>
                ) : selectedStudentForReport ? (
                    <div className="mt-4 space-y-6">
                        {/* Student Details Card */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student Name:</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {reportDetails?.profile
                                            ? `${reportDetails.profile.firstName || ""} ${reportDetails.profile.lastName || ""}`.trim()
                                            : selectedStudentForReport.name}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Student ID:</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {reportDetails?.profile?.id || selectedStudentForReport.id}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Standard:</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {reportDetails?.standard || selectedStudentForReport.standard || (selectedStandard !== "All Standards" ? selectedStandard : "5th")}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Division:</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {reportDetails?.division || selectedStudentForReport.division || (selectedDivision !== "All Divisions" ? selectedDivision : "A")}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Roll Number:</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {reportDetails?.rollNumber || selectedStudentForReport.rollNumber || "-"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">School:</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                        {reportDetails?.schoolName || "SpeakMate Partner School"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Performance Section */}
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3">
                                Performance
                            </h4>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Attendance</span>
                                    <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                                        {reportDetails?.attendanceRate != null ? `${reportDetails.attendanceRate}%` : "92%"}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Lesson Progress</span>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                                        {reportDetails?.performance?.lessonsCompleted ?? reportDetails?.practiceStatistics?.totalLessonsCompleted ?? 0} Done
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Grammar</span>
                                    <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                                        {reportDetails?.performance?.grammarScore != null
                                            ? `${Math.round(reportDetails.performance.grammarScore)}%`
                                            : `${selectedStudentForReport.grammarScore}%`}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Vocabulary</span>
                                    <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                                        {reportDetails?.performance?.vocabularyScore != null
                                            ? `${Math.round(reportDetails.performance.vocabularyScore)}%`
                                            : `${selectedStudentForReport.vocabularyScore}%`}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Speaking</span>
                                    <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                                        {reportDetails?.performance?.speakingScore != null
                                            ? `${Math.round(reportDetails.performance.speakingScore)}%`
                                            : `${selectedStudentForReport.speakingScore}%`}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Listening</span>
                                    <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">
                                        {reportDetails?.performance?.listeningScore != null
                                            ? `${Math.round(reportDetails.performance.listeningScore)}%`
                                            : `${selectedStudentForReport.listeningScore}%`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Speaking & Practice Highlights if available */}
                        {reportDetails?.practiceStatistics && (
                            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                                    <span>Speaking Sessions: {reportDetails.practiceStatistics.totalSpeakingSessions || 0}</span>
                                    <span>Practice Time: {reportDetails.practiceStatistics.totalPracticeMinutes || 0} mins</span>
                                    <span>Vocabulary Words: {reportDetails.practiceStatistics.totalVocabularyWords || 0}</span>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="secondary"
                                onClick={() => setIsReportModalOpen(false)}
                                className="h-9 px-4 text-xs font-semibold"
                            >
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDownloadReport}
                                className="h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
                            >
                                <Printer className="h-3.5 w-3.5" />
                                Download Report
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </motion.div>
    );
}

export default TeacherReports;
