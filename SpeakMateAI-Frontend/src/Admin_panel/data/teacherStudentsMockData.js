import { getTeacherStudentIdentity } from "@/Admin_panel/data/teacherStudentDetailsMockData";

const studentLearningSummaries = [
    { studentId: "STU-0001", overallProgress: 92, grammar: 90, vocabulary: 94, speaking: 91, listening: 93, lastActive: "12 min ago" },
    { studentId: "STU-0002", overallProgress: 87, grammar: 88, vocabulary: 91, speaking: 84, listening: 86, lastActive: "28 min ago" },
    { studentId: "STU-0003", overallProgress: 79, grammar: 81, vocabulary: 76, speaking: 78, listening: 82, lastActive: "1 hr ago" },
    { studentId: "STU-0004", overallProgress: 74, grammar: 72, vocabulary: 79, speaking: 70, listening: 76, lastActive: "2 hrs ago" },
    { studentId: "STU-0005", overallProgress: 66, grammar: 61, vocabulary: 70, speaking: 64, listening: 69, lastActive: "Yesterday" },
    { studentId: "STU-0006", overallProgress: 62, grammar: 67, vocabulary: 65, speaking: 58, listening: 60, lastActive: "Yesterday" },
    { studentId: "STU-0007", overallProgress: 48, grammar: 45, vocabulary: 54, speaking: 42, listening: 51, lastActive: "4 days ago" },
    { studentId: "STU-0008", overallProgress: 41, grammar: 46, vocabulary: 44, speaking: 35, listening: 39, lastActive: "8 days ago" },
];

export const teacherStudentsMockData = {
    assignedStandard: "5th Standard",
    filters: [
        "All Students",
        "High Performers",
        "Needs Attention",
        "Inactive",
    ],
    students: studentLearningSummaries.map(({ studentId, ...learningSummary }) => ({
        ...getTeacherStudentIdentity(studentId),
        ...learningSummary,
    })),
};

export default teacherStudentsMockData;
