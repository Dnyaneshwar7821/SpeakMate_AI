import { getTeacherStudentIdentity } from "@/Admin_panel/data/teacherStudentDetailsMockData";

const topPerformers = [
    { studentId: "STU-0001", overallScore: 92 },
    { studentId: "STU-0002", overallScore: 88 },
    { studentId: "STU-0003", overallScore: 81 },
    { studentId: "STU-0004", overallScore: 76 },
].map(({ studentId, ...analytics }) => ({
    ...getTeacherStudentIdentity(studentId),
    ...analytics,
}));

const studentsRequiringAttention = [
    {
        studentId: "STU-0007",
        weakSkill: "Speaking",
        currentProgress: 49,
        recommendation: "Schedule short guided speaking practice three times this week.",
    },
    {
        studentId: "STU-0008",
        weakSkill: "Speaking",
        currentProgress: 57,
        recommendation: "Use paired conversation prompts to build confidence.",
    },
    {
        studentId: "STU-0005",
        weakSkill: "Vocabulary",
        currentProgress: 66,
        recommendation: "Assign focused revision for the current topic word set.",
    },
].map(({ studentId, ...analytics }) => ({
    ...getTeacherStudentIdentity(studentId),
    ...analytics,
}));

export const teacherAnalyticsMockData = {
    hasAnalyticsData: true,
    meta: {
        assignedStandard: "5th Standard",
        lastUpdated: "Today, 11:30 AM",
        reportingPeriod: "Last 30 days",
    },
    classPerformance: [
        {
            id: "average-score",
            label: "Average Class Score",
            value: "78%",
            change: "+4% from last month",
            tone: "indigo",
        },
        {
            id: "practice-completion",
            label: "Average Practice Completion",
            value: "82%",
            change: "+6% from last month",
            tone: "emerald",
        },
        {
            id: "practice-rate",
            label: "Attendance / Practice Rate",
            value: "86%",
            change: "27 of 32 active this week",
            tone: "violet",
        },
        {
            id: "active-students",
            label: "Active Students",
            value: "27",
            change: "84% of assigned learners",
            tone: "amber",
        },
    ],
    skillPerformance: [
        {
            id: "grammar",
            label: "Grammar",
            averageScore: 81,
            trend: 5,
            insight: "Sentence structure accuracy is improving across recent practice.",
            tone: "indigo",
        },
        {
            id: "vocabulary",
            label: "Vocabulary",
            averageScore: 86,
            trend: 7,
            insight: "The class is strongest when applying topic-based vocabulary.",
            tone: "emerald",
        },
        {
            id: "speaking",
            label: "Speaking",
            averageScore: 72,
            trend: -3,
            insight: "Participation dipped this week and may need guided activities.",
            tone: "rose",
        },
        {
            id: "listening",
            label: "Listening",
            averageScore: 75,
            trend: 1,
            insight: "Comprehension is stable, with scope for focused classroom review.",
            tone: "violet",
        },
    ],
    performanceTrends: [
        {
            id: "weekly-progress",
            title: "Weekly Progress",
            value: "+4.2%",
            description: "Average class score across the last seven days.",
            points: [52, 58, 55, 64, 68, 73, 78],
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            tone: "indigo",
        },
        {
            id: "monthly-progress",
            title: "Monthly Progress",
            value: "+9.5%",
            description: "Learning growth across the current reporting period.",
            points: [48, 56, 63, 72],
            labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
            tone: "violet",
        },
        {
            id: "practice-trend",
            title: "Practice Completion Trend",
            value: "82%",
            description: "Share of assigned activities completed each week.",
            points: [60, 67, 64, 75, 71, 80, 82],
            labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
            tone: "emerald",
        },
    ],
    topPerformers,
    studentsRequiringAttention,
    learningInsights: [
        {
            id: "grammar-growth",
            title: "Grammar is improving steadily",
            detail: "Average accuracy increased by 5% during this reporting period.",
            tone: "indigo",
        },
        {
            id: "speaking-decline",
            title: "Speaking participation has decreased",
            detail: "Session participation is 3% lower than last week.",
            tone: "rose",
        },
        {
            id: "vocabulary-strength",
            title: "Vocabulary is the strongest area",
            detail: "The class average of 86% leads all learning skills.",
            tone: "emerald",
        },
        {
            id: "listening-focus",
            title: "Listening needs classroom focus",
            detail: "Targeted comprehension exercises may improve consistency.",
            tone: "violet",
        },
    ],
};

export default teacherAnalyticsMockData;
