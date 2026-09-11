const sharedLearningDetails = {
    recentActivity: [
        {
            id: "activity-001",
            title: "Completed grammar practice",
            detail: "Scored 9 of 10 in Subject-Verb Agreement.",
            time: "Today, 10:20 AM",
            tone: "indigo",
        },
        {
            id: "activity-002",
            title: "Finished a speaking exercise",
            detail: "Practised a two-minute classroom introduction.",
            time: "Yesterday, 4:45 PM",
            tone: "emerald",
        },
        {
            id: "activity-003",
            title: "Reviewed vocabulary set",
            detail: "Revised 18 words from the School Life topic.",
            time: "28 Jul, 6:10 PM",
            tone: "amber",
        },
        {
            id: "activity-004",
            title: "Completed listening practice",
            detail: "Answered 8 of 10 comprehension questions correctly.",
            time: "27 Jul, 5:30 PM",
            tone: "violet",
        },
    ],
    strengths: [
        "Uses new vocabulary accurately in short responses",
        "Maintains strong listening comprehension across recent lessons",
        "Completes assigned practice consistently",
    ],
    improvementAreas: [
        "Use longer sentences during speaking exercises",
        "Review punctuation in written grammar responses",
        "Practise pronunciation of multi-syllable words",
    ],
    achievements: [
        {
            id: "achievement-001",
            title: "Grammar Star",
            description: "Completed 20 grammar exercises",
            icon: "grammar",
            earnedOn: "26 Jul 2026",
            tone: "indigo",
        },
        {
            id: "achievement-002",
            title: "Word Explorer",
            description: "Mastered 100 vocabulary words",
            icon: "vocabulary",
            earnedOn: "21 Jul 2026",
            tone: "amber",
        },
        {
            id: "achievement-003",
            title: "Practice Streak",
            description: "Practised for seven consecutive days",
            icon: "streak",
            earnedOn: "18 Jul 2026",
            tone: "emerald",
        },
    ],
};

const studentProfiles = [
    {
        id: "STU-0001",
        name: "Aarav Patel",
        rollNumber: "05-01",
        overallProgress: 92,
        grammar: 90,
        vocabulary: 94,
        speaking: 91,
        listening: 93,
        practiceCompletion: 95,
        status: "Excellent",
        practice: { practiceDays: 24, currentStreak: 8, lastPractice: "Today, 10:20 AM", weeklyCompletion: 100 },
    },
    {
        id: "STU-0002",
        name: "Ananya Sharma",
        rollNumber: "05-02",
        overallProgress: 88,
        grammar: 86,
        vocabulary: 91,
        speaking: 87,
        listening: 89,
        practiceCompletion: 90,
        status: "Excellent",
        practice: { practiceDays: 22, currentStreak: 6, lastPractice: "Today, 9:05 AM", weeklyCompletion: 86 },
    },
    {
        id: "STU-0003",
        name: "Vihaan Rao",
        rollNumber: "05-03",
        overallProgress: 81,
        grammar: 82,
        vocabulary: 79,
        speaking: 80,
        listening: 84,
        practiceCompletion: 82,
        status: "Good",
        practice: { practiceDays: 20, currentStreak: 4, lastPractice: "Yesterday, 6:30 PM", weeklyCompletion: 71 },
    },
    {
        id: "STU-0004",
        name: "Ishita Mehta",
        rollNumber: "05-04",
        overallProgress: 76,
        grammar: 78,
        vocabulary: 74,
        speaking: 75,
        listening: 77,
        practiceCompletion: 78,
        status: "Good",
        practice: { practiceDays: 18, currentStreak: 3, lastPractice: "Yesterday, 5:10 PM", weeklyCompletion: 71 },
    },
    {
        id: "STU-0005",
        name: "Arjun Nair",
        rollNumber: "05-05",
        overallProgress: 68,
        grammar: 69,
        vocabulary: 66,
        speaking: 67,
        listening: 70,
        practiceCompletion: 65,
        status: "Average",
        practice: { practiceDays: 15, currentStreak: 2, lastPractice: "2 days ago", weeklyCompletion: 57 },
    },
    {
        id: "STU-0006",
        name: "Diya Singh",
        rollNumber: "05-06",
        overallProgress: 72,
        grammar: 71,
        vocabulary: 75,
        speaking: 70,
        listening: 73,
        practiceCompletion: 74,
        status: "Average",
        practice: { practiceDays: 17, currentStreak: 3, lastPractice: "Yesterday, 7:00 PM", weeklyCompletion: 71 },
    },
    {
        id: "STU-0007",
        name: "Kabir Joshi",
        rollNumber: "05-07",
        overallProgress: 54,
        grammar: 58,
        vocabulary: 55,
        speaking: 49,
        listening: 54,
        practiceCompletion: 48,
        status: "Needs Attention",
        practice: { practiceDays: 10, currentStreak: 1, lastPractice: "4 days ago", weeklyCompletion: 29 },
    },
    {
        id: "STU-0008",
        name: "Meera Kapoor",
        rollNumber: "05-08",
        overallProgress: 61,
        grammar: 63,
        vocabulary: 65,
        speaking: 57,
        listening: 60,
        practiceCompletion: 55,
        status: "Needs Attention",
        practice: { practiceDays: 12, currentStreak: 1, lastPractice: "3 days ago", weeklyCompletion: 43 },
    },
];

export const teacherStudentDetailsMockData = Object.fromEntries(
    studentProfiles.map((student) => [
        student.id,
        {
            ...student,
            assignedStandard: "5th Standard",
            ...sharedLearningDetails,
        },
    ]),
);

export function getTeacherStudentIdentity(studentId) {
    const student = teacherStudentDetailsMockData[studentId];

    if (!student) return null;

    return {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        assignedStandard: student.assignedStandard,
        status: student.status,
    };
}

export default teacherStudentDetailsMockData;
