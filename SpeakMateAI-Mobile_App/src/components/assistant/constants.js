/**
 * Role-aware copy + navigation configuration for the SpeakMate AI Assistant
 * mobile floating widget.
 */

export const ROLE_LABEL = Object.freeze({
  STUDENT: 'Student',
  USER: 'Learner',
});

export const WELCOME_TEXT_BY_ROLE = Object.freeze({
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

export const QUICK_SUGGESTIONS_BY_ROLE = Object.freeze({
  STUDENT: [
    'What have I done across all modules?',
    'How do I unlock Confident Conversationalist badge?',
    'How much XP is needed for Level 5?',
    'Explain the difference between Past Simple and Present Perfect',
    'Give me tips to improve my speaking fluency',
    'What homework do I have due?',
    'How is my speaking fluency and pronunciation?',
  ],
  USER: [
    'What have I done across all modules?',
    'How do I unlock Confident Conversationalist badge?',
    'How much XP do I need to reach Level 5?',
    "Correct this sentence: She don't like apples",
    'What AI avatars and scenarios can I chat with?',
    'Give me tips to improve my speaking fluency and overcome hesitation',
    'Where should I focus to improve?',
  ],
});

export const DEEP_LINKS_BY_ROLE = Object.freeze({
  STUDENT: [
    { label: 'View my progress', route: '/progress', targetRole: 'STUDENT' },
    { label: 'Practice speaking', route: '/speaking', targetRole: 'STUDENT' },
    { label: 'Study lessons', route: '/lessons', targetRole: 'STUDENT' },
    { label: 'View achievements', route: '/achievements', targetRole: 'STUDENT' },
  ],
  USER: [
    { label: 'View my progress', route: '/progress', targetRole: 'USER' },
    { label: 'Practice speaking', route: '/speaking', targetRole: 'USER' },
    { label: 'Study lessons', route: '/lessons', targetRole: 'USER' },
    { label: 'View achievements', route: '/achievements', targetRole: 'USER' },
  ],
});

export const RENDER_WHITELIST = Object.freeze({
  '/progress': '/progress',
  '/speaking': '/speaking',
  '/lessons': '/lessons',
  '/vocabulary': '/vocabulary',
  '/grammar': '/grammar',
  '/achievements': '/achievements',
  '/assignments': '/assignments',
  '/dashboard': '/dashboard',
  '/subscription': '/subscription',
  '/settings': '/settings',
  '/profile': '/profile',
});

export const DEFAULT_ROLE = 'USER';

export default {
  ROLE_LABEL,
  WELCOME_TEXT_BY_ROLE,
  QUICK_SUGGESTIONS_BY_ROLE,
  DEEP_LINKS_BY_ROLE,
  RENDER_WHITELIST,
  DEFAULT_ROLE,
};
