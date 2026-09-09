import { getTeacherStudentIdentity } from "@/Admin_panel/data/teacherStudentDetailsMockData";

const studentPerformanceReportIdentity = getTeacherStudentIdentity("STU-0001");

export const teacherReportsMockData = {
    hasReports: true,
    meta: {
        assignedStandard: "5th Standard",
        academicSession: "2026-27",
    },
    categories: [
        {
            id: "weekly-report",
            title: "Weekly Report",
            description: "A concise summary of class participation, practice, and learning outcomes for the week.",
            lastGenerated: "27 Jul 2026",
            actionLabel: "Generate Report",
            tone: "indigo",
        },
        {
            id: "monthly-report",
            title: "Monthly Report",
            description: "A structured month-end review of progress, completion, and notable class activity.",
            lastGenerated: "30 Jun 2026",
            actionLabel: "Generate Report",
            tone: "violet",
        },
        {
            id: "class-progress-report",
            title: "Class Progress Report",
            description: "A class-wide record of assessment results, skill coverage, and learning milestones.",
            lastGenerated: "18 Jul 2026",
            actionLabel: "Prepare Report",
            tone: "emerald",
        },
        {
            id: "student-performance-report",
            title: "Student Performance Report",
            description: "An individual learner summary covering scores, practice consistency, and support notes.",
            lastGenerated: "22 Jul 2026",
            actionLabel: "Select Student",
            tone: "amber",
        },
    ],
    recentReports: [
        {
            id: "report-001",
            name: "Weekly Class Summary - Week 30",
            generatedDate: "27 Jul 2026",
            type: "Weekly",
            status: "Ready",
        },
        {
            id: "report-002",
            studentId: studentPerformanceReportIdentity.id,
            name: `Student Performance - ${studentPerformanceReportIdentity.name}`,
            generatedDate: "22 Jul 2026",
            type: "Student",
            status: "Ready",
        },
        {
            id: "report-003",
            name: "5th Standard Class Progress",
            generatedDate: "18 Jul 2026",
            type: "Class Progress",
            status: "Reviewed",
        },
        {
            id: "report-004",
            name: "Monthly Learning Summary - June",
            generatedDate: "30 Jun 2026",
            type: "Monthly",
            status: "Archived",
        },
    ],
    performanceSummary: [
        {
            id: "average-class-score",
            label: "Average Class Score",
            value: "78%",
            context: "Recorded in the latest class report",
            tone: "indigo",
        },
        {
            id: "practice-sessions",
            label: "Total Practice Sessions",
            value: "186",
            context: "Documented this reporting period",
            tone: "violet",
        },
        {
            id: "completed-assessments",
            label: "Completed Assessments",
            value: "24",
            context: "Across all assigned learners",
            tone: "emerald",
        },
        {
            id: "attention-required",
            label: "Students Requiring Attention",
            value: "3",
            context: "Flagged for teacher follow-up",
            tone: "rose",
        },
    ],
    upcomingReports: [
        {
            id: "upcoming-weekly",
            title: "Weekly Class Report",
            scheduledDate: "03 Aug 2026",
            coverage: "27 Jul - 02 Aug",
            status: "Scheduled",
        },
        {
            id: "upcoming-monthly",
            title: "Monthly Progress Report",
            scheduledDate: "31 Aug 2026",
            coverage: "August 2026",
            status: "Scheduled",
        },
    ],
};

export default teacherReportsMockData;
