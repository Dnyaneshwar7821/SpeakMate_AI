/**
 * utils/formatters.js
 *
 * Pure utility functions for formatting data.
 * No side effects. Easy to unit test.
 */

/**
 * Format a date to a human-readable string
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 */
export function formatDate(date, options = {}) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Format seconds into mm:ss display
 * @param {number} seconds
 */
export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Format a score number into a percentage string
 * @param {number} score 0–100
 */
export function formatScore(score) {
  return `${Math.round(score)}%`;
}

/**
 * Format XP points with comma separators
 * @param {number} xp
 */
export function formatXP(xp) {
  return xp ? xp.toLocaleString("en-US") : "0";
}

/**
 * Get user-friendly English proficiency label from numeric level or level string.
 * Mapping:
 * - Level 1–2 → Beginner
 * - Level 3–4 → Intermediate
 * - Level 5+  → Advanced
 *
 * @param {number|string|null|undefined} level
 * @returns {string} "Beginner" | "Intermediate" | "Advanced"
 */
export function getEnglishLevelLabel(level) {
  if (level === null || level === undefined) return "Beginner";

  if (typeof level === "object") {
    level = level.level ?? level.englishLevel ?? level.levelName ?? null;
  }

  if (typeof level === "string") {
    const trimmed = level.trim();
    const matchNum = trimmed.match(/(?:level\s*)?(\d+)/i);
    if (matchNum && matchNum[1]) {
      const parsed = parseInt(matchNum[1], 10);
      if (!isNaN(parsed) && parsed > 0) {
        return getEnglishLevelLabel(parsed);
      }
    }

    const lower = trimmed.toLowerCase();
    if (lower.includes("advanced") || lower.includes("c1") || lower.includes("c2") || lower.includes("mastery")) {
      return "Advanced";
    }
    if (lower.includes("intermediate") || lower.includes("b1") || lower.includes("b2")) {
      return "Intermediate";
    }
    if (lower.includes("beginner") || lower.includes("elementary") || lower.includes("basic") || lower.includes("a1") || lower.includes("a2")) {
      return "Beginner";
    }
    return "Beginner";
  }

  const num = Number(level);
  if (isNaN(num) || num < 1) return "Beginner";
  if (num <= 2) return "Beginner";
  if (num <= 4) return "Intermediate";
  return "Advanced";
}


/**
 * Get score label from numeric score
 * @param {number} score
 */
export function getScoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Work";
}

/**
 * Get score color CSS variable from numeric score
 * @param {number} score
 */
export function getScoreColor(score) {
  if (score >= 90) return "var(--color-accent)";
  if (score >= 75) return "var(--color-primary)";
  if (score >= 60) return "var(--color-warning)";
  return "var(--color-error)";
}

/**
 * Truncate a string to a max length with ellipsis
 * @param {string} str
 * @param {number} maxLength
 */
export function truncate(str, maxLength = 100) {
  if (!str || str.length <= maxLength) return str;
  return str.slice(0, maxLength).trim() + "…";
}

/**
 * Capitalize the first letter of a string
 * @param {string} str
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string|Date} date
 */
export function timeAgo(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return formatDate(d, { month: "short", day: "numeric" });
}

/**
 * Get initials from a full name string
 * @param {string} name
 */
export function getInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}
