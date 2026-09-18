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
Hi! I'm **SpeakMate Student Assistant** 👋

I can help you with:
- **Your progress** — lessons completed, fluency scores and streaks
- **School practice** — speaking drills and practice for your grade
- **Vocabulary & grammar** — learn words and sentence practice

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    USER: `
Hi! I'm **SpeakMate AI Assistant** 👋

I can help you with:
- **Conversational fluency** — practice speaking naturally in English
- **Daily practice** — check your streak, lessons and fluency score
- **Account & subscription** — plan details, settings and daily goals

Ask me a question or tap a suggestion below to get started.
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
        "How is my class performing?",
        "Show me a student's progress",
        "What does my analytics dashboard show?",
        "What are common pronunciation errors in my class?",
    ],
    STUDENT: [
        "Show me my progress",
        "How many lessons have I completed?",
        "What should I practice for my grade?",
        "What is my current speaking streak?",
    ],
    USER: [
        "How is my speaking streak?",
        "Recommend a conversation topic",
        "What email am I logged in with?",
        "What is my subscription plan?",
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
    ],
    TEACHER: [
        { label: "Open full analytics", route: ROUTES.TEACHER_ANALYTICS, targetRole: "TEACHER" },
    ],
    STUDENT: [],
    USER: [],
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
    [ROUTES.TEACHER_ANALYTICS]: ROUTES.TEACHER_ANALYTICS,
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
