import { useState, useMemo } from "react";

const generateHistory = (baseScore) => {
    return [
        { name: 'W1', score: Math.max(0, baseScore - 15) },
        { name: 'W2', score: Math.max(0, baseScore - 5) },
        { name: 'W3', score: Math.min(100, baseScore + 2) },
        { name: 'W4', score: baseScore }
    ];
};

const generateSkills = (base) => [
    { subject: 'Grammar', score: Math.min(100, base + Math.floor(Math.random() * 15 - 5)) },
    { subject: 'Vocabulary', score: Math.min(100, base + Math.floor(Math.random() * 15 - 5)) },
    { subject: 'Speaking', score: Math.min(100, base + Math.floor(Math.random() * 20 - 10)) },
    { subject: 'Listening', score: Math.min(100, base + Math.floor(Math.random() * 10 - 5)) },
    { subject: 'Reading', score: Math.min(100, base + Math.floor(Math.random() * 15 - 5)) },
];

const generateActivity = () => [
    { day: 'Mon', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Tue', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Wed', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Thu', hours: (Math.random() * 2 + 0.5).toFixed(1) },
    { day: 'Fri', hours: (Math.random() * 2 + 0.5).toFixed(1) },
];

const initialStudents = [
    { id: "stu-1", name: "Aarav Patel", email: "aarav.patel@school.edu", standard: 10, rollNo: "10A01", status: "active", joinedAt: "2025-06-12", assignedTeacher: "Mr. Sharma", progress: { level: 12, xp: 4500, nextLevelXp: 5000, batch: "Gold Scholar", completedLessons: 24, totalLessons: 30, percentage: 80, quizzes: 12, averageScore: 88, lastActive: "2025-10-01", history: generateHistory(88), skills: generateSkills(85), weeklyActivity: generateActivity() } },
    { id: "stu-2", name: "Diya Sharma", email: "diya.sharma@school.edu", standard: 9, rollNo: "9B14", status: "active", joinedAt: "2025-06-15", assignedTeacher: "Mrs. Verma", progress: { level: 15, xp: 6200, nextLevelXp: 7000, batch: "Diamond Scholar", completedLessons: 45, totalLessons: 50, percentage: 90, quizzes: 20, averageScore: 92, lastActive: "2025-10-15", history: generateHistory(92), skills: generateSkills(92), weeklyActivity: generateActivity() } },
    { id: "stu-3", name: "Kiran Singh", email: "kiran.singh@school.edu", standard: 10, rollNo: "10A07", status: "inactive", joinedAt: "2025-07-01", assignedTeacher: "Mr. Sharma", progress: { level: 4, xp: 1200, nextLevelXp: 2000, batch: "Bronze Learner", completedLessons: 10, totalLessons: 30, percentage: 33, quizzes: 4, averageScore: 65, lastActive: "2025-08-20", history: generateHistory(65), skills: generateSkills(60), weeklyActivity: generateActivity() } },
    { id: "stu-4", name: "Meera Nair", email: "meera.nair@school.edu", standard: 8, rollNo: "8C03", status: "active", joinedAt: "2025-07-10", assignedTeacher: "Ms. Gupta", progress: { level: 18, xp: 8900, nextLevelXp: 9500, batch: "Platinum Achiever", completedLessons: 60, totalLessons: 60, percentage: 100, quizzes: 30, averageScore: 95, lastActive: "2025-10-14", history: generateHistory(95), skills: generateSkills(95), weeklyActivity: generateActivity() } },
    { id: "stu-5", name: "Rohan Gupta", email: "rohan.gupta@school.edu", standard: 9, rollNo: "9B22", status: "active", joinedAt: "2025-08-05", assignedTeacher: "Mrs. Verma", progress: { level: 7, xp: 2800, nextLevelXp: 3500, batch: "Silver Learner", completedLessons: 20, totalLessons: 50, percentage: 40, quizzes: 10, averageScore: 81, lastActive: "2025-10-05", history: generateHistory(81), skills: generateSkills(75), weeklyActivity: generateActivity() } },
];

const initialTeachers = [
    { id: "tch-1", name: "Mr. Sharma", email: "sharma@school.edu", subject: "English Literature", status: "active", joinedAt: "2020-03-10" },
    { id: "tch-2", name: "Mrs. Verma", email: "verma@school.edu", subject: "Grammar & Composition", status: "active", joinedAt: "2018-07-22" },
    { id: "tch-3", name: "Ms. Gupta", email: "gupta@school.edu", subject: "Spoken English", status: "active", joinedAt: "2023-01-15" },
    { id: "tch-4", name: "Mr. Iyer", email: "iyer@school.edu", subject: "Advanced Vocabulary", status: "inactive", joinedAt: "2019-11-05" },
];

let globalStudents = [...initialStudents];
let globalTeachers = [...initialTeachers];

export function useStudents() {
    const [students, setStudents] = useState(globalStudents);
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return students;
        return students.filter(
            (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q)
        );
    }, [students, searchTerm]);

    const addStudent = (data) => {
        const newStudent = { ...data, id: `stu-${Date.now()}`, joinedAt: new Date().toISOString().slice(0, 10) };
        globalStudents = [newStudent, ...globalStudents];
        setStudents([...globalStudents]);
    };

    const updateStudent = (id, data) => {
        globalStudents = globalStudents.map((s) => (s.id === id ? { ...s, ...data } : s));
        setStudents([...globalStudents]);
    };

    const deleteStudent = (id) => {
        globalStudents = globalStudents.filter((s) => s.id !== id);
        setStudents([...globalStudents]);
    };

    return { students: filtered, totalStudents: students.length, searchTerm, setSearchTerm, addStudent, updateStudent, deleteStudent };
}

const initialResults = [
    { id: "res-1", studentName: "Aarav Patel", standard: 10, testTitle: "English Grammar Basics", marksObtained: 42, totalMarks: 50, percentage: 84, status: "Passed", submittedAt: "2026-06-15" },
    { id: "res-2", studentName: "Diya Sharma", standard: 9, testTitle: "Mathematics — Algebra", marksObtained: 88, totalMarks: 100, percentage: 88, status: "Passed", submittedAt: "2026-06-22" },
    { id: "res-3", studentName: "Kiran Singh", standard: 10, testTitle: "English Grammar Basics", marksObtained: 28, totalMarks: 50, percentage: 56, status: "Passed", submittedAt: "2026-06-16" },
    { id: "res-4", studentName: "Meera Nair", standard: 8, testTitle: "Social Studies — History", marksObtained: 65, totalMarks: 70, percentage: 93, status: "Passed", submittedAt: "2026-07-12" },
    { id: "res-5", studentName: "Rohan Gupta", standard: 9, testTitle: "Mathematics — Algebra", marksObtained: 45, totalMarks: 100, percentage: 45, status: "Failed", submittedAt: "2026-06-23" },
];

let globalResults = [...initialResults];

export function useResults() {
    const [results, setResults] = useState(globalResults);
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return results;
        return results.filter((r) => r.studentName.toLowerCase().includes(q) || r.testTitle.toLowerCase().includes(q));
    }, [results, searchTerm]);

    const addResult = (data) => {
        const newResult = { ...data, id: `res-${Date.now()}`, percentage: Math.round((data.marksObtained / data.totalMarks) * 100) };
        globalResults = [newResult, ...globalResults];
        setResults([...globalResults]);
    };

    const updateResult = (id, data) => {
        globalResults = globalResults.map((r) => (r.id === id ? { ...r, ...data, percentage: data.marksObtained && data.totalMarks ? Math.round((data.marksObtained / data.totalMarks) * 100) : r.percentage } : r));
        setResults([...globalResults]);
    };

    const deleteResult = (id) => {
        globalResults = globalResults.filter((r) => r.id !== id);
        setResults([...globalResults]);
    };

    return {
        results: filtered,
        totalResults: results.length,
        searchTerm,
        setSearchTerm,
        addResult,
        updateResult,
        deleteResult
    };
}

export function useTeachers() {
    const [teachers, setTeachers] = useState(globalTeachers);
    const [searchTerm, setSearchTerm] = useState("");

    const addTeacher = (teacher) => {
        globalTeachers = [{ ...teacher, id: `tch-${Date.now()}`, joinedAt: new Date().toISOString().split('T')[0] }, ...globalTeachers];
        setTeachers([...globalTeachers]);
    };

    const updateTeacher = (id, updated) => {
        globalTeachers = globalTeachers.map(t => t.id === id ? { ...t, ...updated } : t);
        setTeachers([...globalTeachers]);
    };

    const deleteTeacher = (id) => {
        globalTeachers = globalTeachers.filter(t => t.id !== id);
        setTeachers([...globalTeachers]);
    };

    const getStudentsForTeacher = (teacherName) => {
        return globalStudents.filter(s => s.assignedTeacher === teacherName);
    };

    const filteredTeachers = useMemo(() => {
        return teachers.filter(t =>
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [teachers, searchTerm]);

    return {
        teachers: filteredTeachers,
        totalTeachers: teachers.length,
        searchTerm,
        setSearchTerm,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        getStudentsForTeacher
    };
}
