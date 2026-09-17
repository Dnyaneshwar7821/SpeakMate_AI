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
    USER: "User",
});

/** First-open welcome message shown per role (before any backend call). */
export const WELCOME_TEXT_BY_ROLE = Object.freeze({
    SUPER_ADMIN: `
Hi! I'm **SpeakMate Assistant** 👋

I can help you with:
- **Platform overview** — total schools, students, teachers, active subscriptions
- **Billing & revenue** — paid vs trial subscriptions and revenue health
- **School insights** — school-wise engagement and status distribution

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    SCHOOL_ADMIN: `
Hi! I'm **SpeakMate Assistant** 👋

I can help you with:
- **Your school overview** — students, teachers, class strength and engagement
- **Class performance** — how divisions and classrooms are performing
- **Student lookups** — progress snapshots for specific students

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    TEACHER: `
Hi! I'm **SpeakMate Assistant** 👋

I can help you with:
- **Class performance** — engagement and results for your classes
- **Student lookups** — progress snapshots for students assigned to you

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    STUDENT: `
Hi! I'm **SpeakMate Assistant** 👋

I can help you track **your own progress** — lessons completed, scores and streaks.

Ask me a question or tap a suggestion below to get started.
  `.trim(),
    USER: `
Hi! I'm **SpeakMate Assistant** 👋

I can help you with:
- **Your account** — the email, name and role you are signed in with
- **Navigation help** — getting around the app

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
    ],
    SCHOOL_ADMIN: [
        "Give me an overview of my school",
        "How are my classes performing?",
        "Show me a student's progress",
    ],
    TEACHER: [
        "How is my class performing?",
        "Show me a student's progress",
        "What does my analytics dashboard show?",
    ],
    STUDENT: [
        "Show me my progress",
        "How many lessons have I completed?",
    ],
    USER: [
        "What email am I logged in with?",
        "What is my account role?",
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
export const DEFAULT_ROLE = "SUPER_ADMIN";

export const ASSISTANT_CONSTANTS = Object.freeze({
    WELCOME_TEXT_BY_ROLE,
    QUICK_SUGGESTIONS_BY_ROLE,
    DEEP_LINKS_BY_ROLE,
    RENDER_WHITELIST,
    ROLE_LABEL,
});

export default ASSISTANT_CONSTANTS;
