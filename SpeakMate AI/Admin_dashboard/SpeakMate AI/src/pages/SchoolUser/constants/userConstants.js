export const PROFICIENCY_LEVELS = ['All', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Fluent'];

export const USER_STATUSES = ['All', 'Active', 'Inactive'];

export const DEFAULT_ITEMS_PER_PAGE = 10;

export const STATUS_COLORS = {
  Active: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
  Inactive: { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' },
  Pending: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
  Suspended: { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
};

export const PROFICIENCY_LEVEL_COLORS = {
  Beginner: { bg: '#e0f2fe', text: '#0369a1' },
  Elementary: { bg: '#e0e7ff', text: '#4338ca' },
  Intermediate: { bg: '#fae8ff', text: '#a21caf' },
  Advanced: { bg: '#fce7f3', text: '#be185d' },
  Fluent: { bg: '#dcfce7', text: '#15803d' },
};

export const ENGLISH_LEVELS = PROFICIENCY_LEVELS;
export const ENGLISH_LEVEL_COLORS = PROFICIENCY_LEVEL_COLORS;
