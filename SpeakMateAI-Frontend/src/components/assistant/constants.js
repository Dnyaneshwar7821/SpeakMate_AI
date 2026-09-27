import ROUTES from "./routes";

/**
 * Role-aware copy + navigation configuration for the SpeakMate AI Assistant
 * floating widget.
 */

/** Human-friendly role labels used for the panel badge. */
export const ROLE_LABEL = Object.freeze({
    SUPER_ADMIN: "Super Admin",
    SCHOOL_ADMIN: "School Admin",
    TEACHER: "Teacher",
    STUDENT: "Student",
    USER: "Learner",
});

/** First-open welcome message shown per role (before any backend call). */
export const WELCOME_TEXT_BY_ROLE = Object.freeze({
    SUPER_ADMIN: `
Hi! I'm **SpeakMate Super Admin Assistant** 👋

I can help you with:
- **Platform overview** — total schools, students, teachers, active subscriptions
- **Billing & revenue** — paid vs trial subscriptions and revenue health
- **School insights** — school-wise engagement and status distribution
- **Student progress lookups** — check any student's learning progress across schools

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    SCHOOL_ADMIN: `
Hi! I'm **SpeakMate School Admin Assistant** 👋

I can help you with:
- **Your school overview** — students, teachers, class strength and engagement
- **Class performance** — how divisions and classrooms are performing
- **Student lookups** — progress snapshots for students in your school

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    TEACHER: `
Hi! I'm **SpeakMate Teacher Assistant** 👋

I can help you with:
- **Class performance** — engagement and results for your assigned classes
- **Student lookups** — progress snapshots for students assigned to you
- **Analytics & reports** — common pronunciation mistakes and lesson progress

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    STUDENT: `
Hi! I'm **SpeakMate Student Assistant & AI English Tutor** 🎓

I'm here to help you become a confident English speaker:
- **🎙️ Speaking Coach** — practice dialogue with AI Avatars, improve fluency & pronunciation
- **📝 Grammar Tutor** — clear rule explanations, tenses, prepositions & sentence checks
- **💡 Vocabulary Builder** — discover new words, idioms, meanings & practical usage
- **📚 Lessons & Homework** — track curriculum lessons, school assignments & due dates
- **🏆 Badges & Level 5** — roadmap for *Confident Conversationalist* (5 distinct scenarios) and Level 5 (2,500 XP)

Ask me a question or tap a suggestion below to get started!
  `.trim(),
    USER: `
Hi! I'm **SpeakMate AI English Coach** 🎓

I'm here to help you achieve fluent, natural English communication:
- **🎙️ Conversational Speaking** — practice scenarios (job interviews, cafe, travel) with AI Avatars
- **📝 Grammar & Phrasing** — sentence corrections with grammar rule breakdowns
- **💡 Vocabulary & Idioms** — master collocations, business phrases & idioms
- **⚡ Milestones & Streaks** — track progress toward Level 5 (2,500 XP) and *Confident Conversationalist*
- **📊 Fluency Analytics** — detailed feedback on speech rhythm, pronunciation & vocabulary

Ask me a question or tap a suggestion below to get started!
  `.trim(),
});

/** Quick suggestion chips shown when the conversation is empty. */
export const QUICK_SUGGESTIONS_BY_ROLE = Object.freeze({
    SUPER_ADMIN: [
        "How is the platform performing overall?",
        "Show me subscription and billing health",
        "Which schools have the most students?",
        "List all users on the platform",
        "Check a student's progress across schools",
    ],
    SCHOOL_ADMIN: [
        "Give me an overview of my school",
        "How are my classes performing?",
        "Show me a student's progress",
        "List all teachers in my school",
    ],
    TEACHER: [
        "Who are my assigned students?",
        "How is my class performing?",
        "Show me Siddhi Narke's progress",
        "What does my analytics dashboard show?",
        "What are common pronunciation errors in my class?",
    ],
    STUDENT: [
        "What have I done across all modules?",
        "How do I unlock Confident Conversationalist badge?",
        "How much XP is needed for Level 5?",
        "Explain the difference between Past Simple and Present Perfect",
        "Give me tips to improve my speaking fluency",
        "What homework do I have due?",
        "How is my speaking fluency and pronunciation?",
    ],
    USER: [
        "What have I done across all modules?",
        "How do I unlock Confident Conversationalist badge?",
        "How much XP do I need to reach Level 5?",
        "Correct this sentence: She don't like apples",
        "What AI avatars and conversation scenarios can I chat with?",
        "Give me tips to improve my speaking fluency and overcome hesitation",
        "Where should I focus to improve?",
    ],
});

/**
 * Deep-link suggestions by role. route must exist in ROUTES and be present in
 * RENDER_WHITELIST to ever render as a clickable chip.
 */
export const DEEP_LINKS_BY_ROLE = Object.freeze({
    SUPER_ADMIN: [
        { label: "Open full analytics", route: ROUTES.ADMIN_INSIGHTS, targetRole: "SUPER_ADMIN" },
        { label: "View all users", route: ROUTES.ADMIN_USERS, targetRole: "SUPER_ADMIN" },
    ],
    SCHOOL_ADMIN: [
        { label: "Open full analytics", route: ROUTES.SCHOOL_ADMIN_INSIGHTS, targetRole: "SCHOOL_ADMIN" },
        { label: "View school students", route: ROUTES.SCHOOL_ADMIN_STUDENTS, targetRole: "SCHOOL_ADMIN" },
    ],
    TEACHER: [
        { label: "Open full analytics", route: ROUTES.TEACHER_ANALYTICS, targetRole: "TEACHER" },
        { label: "View my students", route: ROUTES.TEACHER_STUDENTS, targetRole: "TEACHER" },
    ],
    STUDENT: [
        { label: "View my progress", route: ROUTES.PROGRESS, targetRole: "STUDENT" },
        { label: "Practice speaking", route: ROUTES.SPEAKING, targetRole: "STUDENT" },
        { label: "View achievements", route: ROUTES.ACHIEVEMENTS, targetRole: "STUDENT" },
    ],
    USER: [
        { label: "View my progress", route: ROUTES.PROGRESS, targetRole: "USER" },
        { label: "Practice speaking", route: ROUTES.SPEAKING, targetRole: "USER" },
        { label: "View achievements", route: ROUTES.ACHIEVEMENTS, targetRole: "USER" },
    ],
});

/**
 * Whitelist of every route the assistant may navigate to.
 * Anything not listed here (including future routes) will never be clickable.
 * Keys are kept human-readable; values are compared against backend routes.
 */
export const RENDER_WHITELIST = Object.freeze({
    [ROUTES.ADMIN_INSIGHTS]: ROUTES.ADMIN_INSIGHTS,
    [ROUTES.ADMIN_USERS]: ROUTES.ADMIN_USERS,
    [ROUTES.SCHOOL_ADMIN_INSIGHTS]: ROUTES.SCHOOL_ADMIN_INSIGHTS,
    [ROUTES.SCHOOL_ADMIN_STUDENTS]: ROUTES.SCHOOL_ADMIN_STUDENTS,
    [ROUTES.TEACHER_ANALYTICS]: ROUTES.TEACHER_ANALYTICS,
    [ROUTES.TEACHER_STUDENTS]: ROUTES.TEACHER_STUDENTS,
    [ROUTES.TEACHER_REPORTS]: ROUTES.TEACHER_REPORTS,
    [ROUTES.PROGRESS]: ROUTES.PROGRESS,
    [ROUTES.SPEAKING]: ROUTES.SPEAKING,
    [ROUTES.LESSONS]: ROUTES.LESSONS,
    [ROUTES.VOCABULARY]: ROUTES.VOCABULARY,
    [ROUTES.GRAMMAR]: ROUTES.GRAMMAR,
    [ROUTES.ACHIEVEMENTS]: ROUTES.ACHIEVEMENTS,
    [ROUTES.DASHBOARD]: ROUTES.DASHBOARD,
    "/progress": "/progress",
    "/speaking": "/speaking",
    "/lessons": "/lessons",
    "/vocabulary": "/vocabulary",
    "/grammar": "/grammar",
    "/achievements": "/achievements",
    "/assignments": "/assignments",
    "/dashboard": "/dashboard",
    "/teacher/dashboard": "/teacher/dashboard",
    "/teacher/students": "/teacher/students",
    "/teacher/analytics": "/teacher/analytics",
    "/teacher/reports": "/teacher/reports",
});

/** Default fallback when a role is unknown. */
export const DEFAULT_ROLE = "USER";

export const ASSISTANT_CONSTANTS = Object.freeze({
    WELCOME_TEXT_BY_ROLE,
    QUICK_SUGGESTIONS_BY_ROLE,
    DEEP_LINKS_BY_ROLE,
    RENDER_WHITELIST,
    ROLE_LABEL,
});

export default ASSISTANT_CONSTANTS;
