import { getTeacherStudentIdentity } from "@/Admin_panel/data/teacherStudentDetailsMockData";

const dashboardAttention = [
    { studentId: "STU-0007", progress: 54, reason: "Needs Grammar Practice" },
    { studentId: "STU-0008", progress: 61, reason: "Low Speaking Practice" },
].map((student) => ({
    ...getTeacherStudentIdentity(student.studentId),
    progress: student.progress,
    reason: student.reason,
}));

const recentActivity = [
    { studentId: "STU-0002", action: "completed Vocabulary Practice", time: "18 min ago", tone: "indigo" },
    { studentId: "STU-0008", action: "completed a Speaking Session", time: "42 min ago", tone: "emerald" },
    { studentId: "STU-0003", action: "improved Grammar Score", time: "1 hr ago", tone: "violet" },
    { studentId: "STU-0007", action: "reached a 10-day streak", time: "2 hrs ago", tone: "amber" },
].map(({ studentId, ...activity }) => {
    const identity = getTeacherStudentIdentity(studentId);

    return {
        ...identity,
        ...activity,
        student: identity.name,
    };
});

export const teacherDashboardMockData = {
    teacher: {
        name: "Priya Sharma",
        assignedStandard: "5th Standard Teacher",
    },
    overview: [
        {
            id: "students",
            label: "Total Students",
            value: "32",
            helper: "Assigned to your class",
            tone: "indigo",
        },
        {
            id: "progress",
            label: "Average Class Progress",
            value: "74%",
            helper: "Across all learning skills",
            tone: "emerald",
        },
        {
            id: "attention",
            label: "Students Requiring Attention",
            value: "5",
            helper: "Based on recent practice",
            tone: "rose",
        },
        {
            id: "completion",
            label: "Weekly Practice Completion",
            value: "81%",
            helper: "26 students completed goals",
            tone: "amber",
        },
    ],
    performance: [
        {
            id: "speaking",
            label: "Speaking Performance",
            summary: "Class speaking insights will appear here.",
            tone: "indigo",
        },
        {
            id: "grammar",
            label: "Grammar Performance",
            summary: "Class grammar insights will appear here.",
            tone: "emerald",
        },
        {
            id: "vocabulary",
            label: "Vocabulary Performance",
            summary: "Class vocabulary insights will appear here.",
            tone: "violet",
        },
        {
            id: "listening",
            label: "Listening Performance",
            summary: "Class listening insights will appear here.",
            tone: "amber",
        },
    ],
    studentsRequiringAttention: dashboardAttention,
    recentActivity,
    quickActions: [
        {
            title: "View Students",
            description: "Review your assigned class and individual learning progress.",
            icon: "students",
        },
        {
            title: "View Reports",
            description: "Explore clear summaries of class learning outcomes.",
            icon: "reports",
        },
        {
            title: "Open Analytics",
            description: "Understand skill trends across your assigned standard.",
            icon: "analytics",
        },
    ],
};

export default teacherDashboardMockData;
