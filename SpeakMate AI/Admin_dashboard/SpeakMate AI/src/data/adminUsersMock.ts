export type UserType = "INDIVIDUAL" | "SCHOOL";
export type UserLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface ActivityEvent { id: number; type: "lesson" | "speaking" | "ai" | "achievement"; description: string; timestamp: string; }
export interface ProgressPoint { month: string; fluency: number; grammar: number; vocabulary: number; }
export interface SpeakingSession { id: number; topic: string; duration: string; score: number; date: string; }

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string;
    userType: UserType;
    schoolId?: string;
    schoolName?: string;
    classGrade?: number;
    classSection?: string;
    level: UserLevel;
    status: UserStatus;
    registeredAt: string;
    lastActiveAt: string;
    totalPracticeMinutes: number;
    speakingSessions: number;
    aiConversations: number;
    lessonsCompleted: number;
    currentStreak: number;
    xp: number;
    grammarScore: number;
    fluencyScore: number;
    vocabularyScore: number;
    pronunciationScore: number;
}

export interface UserDetail extends User { activities: ActivityEvent[]; progress: ProgressPoint[]; sessions: SpeakingSession[]; grammarMistakes: { category: string; mistakes: number }[]; vocabularyGrowth: { month: string; words: number }[]; recentWords: { word: string; meaning: string; mastery: number }[]; }

export const schoolOptions = [
    { id: "greenwood", name: "Greenwood Academy", grades: [8, 9, 10], sections: ["A", "B", "C"] },
    { id: "riverside", name: "Riverside School", grades: [7, 8, 11], sections: ["A", "B", "C"] },
    { id: "oakridge", name: "Oakridge International", grades: [6, 9, 12], sections: ["A", "B", "C"] },
];
export const schools = Object.fromEntries(schoolOptions.map((school) => [school.name, school.grades]));

const firstNames = ["Maya", "Liam", "Aarav", "Sophia", "Noah", "Ananya", "Ethan", "Zara", "Lucas", "Meera", "Oliver", "Isha", "Henry", "Amelia", "Leo", "Nina", "Jack", "Aisha", "Daniel", "Emma", "Kabir", "Chloe", "Mateo", "Sara", "Finn", "Riya", "Theo", "Layla", "Arjun", "Grace", "Sam", "Mila", "Adam", "Leah", "Ryan", "Diya", "Ben", "Eva", "Owen", "Tara"];
const lastNames = ["Patel", "Morgan", "Sharma", "Chen", "Williams", "Gupta", "Brown", "Khan", "Martin", "Kapoor"];
const levels: UserLevel[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const statuses: UserStatus[] = ["ACTIVE", "ACTIVE", "ACTIVE", "ACTIVE", "INACTIVE", "SUSPENDED"];
const now = new Date();

export const mockAdminUsers: User[] = firstNames.map((firstName, index) => {
    const school = schoolOptions[index % schoolOptions.length];
    const isIndividual = index % 4 === 0;
    const registered = new Date(now.getFullYear(), now.getMonth() - (index % 10), 2 + (index % 24), 9, 30);
    const lastActive = new Date(now.getTime() - (index % 13) * 86400000 - (index % 9) * 3600000);
    return {
        id: index + 1, firstName, lastName: lastNames[index % lastNames.length], email: `${firstName.toLowerCase()}.${lastNames[index % lastNames.length].toLowerCase()}@example.com`, avatarUrl: "",
        userType: isIndividual ? "INDIVIDUAL" : "SCHOOL", ...(isIndividual ? {} : { schoolId: school.id, schoolName: school.name, classGrade: school.grades[index % school.grades.length], classSection: school.sections[index % school.sections.length] }),
        level: levels[index % levels.length], status: statuses[index % statuses.length], registeredAt: registered.toISOString(), lastActiveAt: lastActive.toISOString(), totalPracticeMinutes: 900 + index * 83, speakingSessions: 18 + index * 3, aiConversations: 12 + index * 2, lessonsCompleted: 10 + index * 2, currentStreak: index % 21, xp: 1200 + index * 287,
        grammarScore: 58 + (index * 7) % 38, fluencyScore: 61 + (index * 9) % 35, vocabularyScore: 55 + (index * 8) % 40, pronunciationScore: 60 + (index * 6) % 36,
    };
});

const featured = mockAdminUsers[0];
export const featuredUserDetail: UserDetail = {
    ...featured, activities: [
        { id: 1, type: "achievement", description: "Earned the 14-day streak achievement", timestamp: "2026-07-27T08:30:00Z" }, { id: 2, type: "speaking", description: "Completed Job Interview Practice with a score of 92", timestamp: "2026-07-26T14:20:00Z" }, { id: 3, type: "lesson", description: "Finished Advanced Phrasal Verbs lesson", timestamp: "2026-07-25T10:00:00Z" }, { id: 4, type: "ai", description: "Had a 22-minute conversation with FluentAI", timestamp: "2026-07-23T16:45:00Z" },
    ], progress: [{ month: "Feb", fluency: 68, grammar: 65, vocabulary: 61 }, { month: "Mar", fluency: 72, grammar: 69, vocabulary: 65 }, { month: "Apr", fluency: 76, grammar: 73, vocabulary: 69 }, { month: "May", fluency: 81, grammar: 76, vocabulary: 72 }, { month: "Jun", fluency: 86, grammar: 80, vocabulary: 75 }, { month: "Jul", fluency: 91, grammar: 84, vocabulary: 78 }],
    sessions: [{ id: 1, topic: "Job Interview Practice", duration: "18 min", score: 92, date: "Jul 26, 2026" }, { id: 2, topic: "Travel & Culture", duration: "24 min", score: 88, date: "Jul 23, 2026" }, { id: 3, topic: "Giving a Presentation", duration: "15 min", score: 85, date: "Jul 20, 2026" }],
    grammarMistakes: [{ category: "Articles", mistakes: 14 }, { category: "Tenses", mistakes: 9 }, { category: "Prepositions", mistakes: 18 }, { category: "Agreement", mistakes: 7 }, { category: "Word order", mistakes: 5 }], vocabularyGrowth: [{ month: "Feb", words: 420 }, { month: "Mar", words: 510 }, { month: "Apr", words: 625 }, { month: "May", words: 730 }, { month: "Jun", words: 860 }, { month: "Jul", words: 980 }], recentWords: [{ word: "ubiquitous", meaning: "present everywhere", mastery: 92 }, { word: "articulate", meaning: "express ideas clearly", mastery: 85 }, { word: "pragmatic", meaning: "dealing with problems practically", mastery: 74 }],
};

export async function mockUsersQuery(): Promise<User[]> { await new Promise((resolve) => setTimeout(resolve, 350)); return mockAdminUsers.map((user) => ({ ...user })); }
export async function mockUserDetailQuery(user: User): Promise<UserDetail> { await new Promise((resolve) => setTimeout(resolve, 150)); return user.id === featured.id ? { ...featuredUserDetail, ...user } : { ...featuredUserDetail, ...user, activities: featuredUserDetail.activities.slice(0, 3) }; }
