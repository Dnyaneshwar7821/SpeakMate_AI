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

export const QUICK_SUGGESTIONS_BY_ROLE = Object.freeze({
  STUDENT: [
    'What have I done across all modules?',
    'What homework do I have due?',
    'What lessons can I do next?',
    'How many achievements have I unlocked?',
    'How is my speaking fluency and pronunciation?',
  ],
  USER: [
    'What have I done across all modules?',
    'What lessons can I do next?',
    'How many achievements have I unlocked?',
    'What AI avatars and scenarios can I chat with?',
    'Where should I focus to improve?',
  ],
});

export const DEEP_LINKS_BY_ROLE = Object.freeze({
  STUDENT: [
    { label: 'View my progress', route: '/progress', targetRole: 'STUDENT' },
    { label: 'Practice speaking', route: '/speaking', targetRole: 'STUDENT' },
    { label: 'Study lessons', route: '/lessons', targetRole: 'STUDENT' },
  ],
  USER: [
    { label: 'View my progress', route: '/progress', targetRole: 'USER' },
    { label: 'Practice speaking', route: '/speaking', targetRole: 'USER' },
    { label: 'Study lessons', route: '/lessons', targetRole: 'USER' },
  ],
});

export const RENDER_WHITELIST = Object.freeze({
  '/progress': '/progress',
  '/speaking': '/speaking',
  '/lessons': '/lessons',
  '/vocabulary': '/vocabulary',
  '/grammar': '/grammar',
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
