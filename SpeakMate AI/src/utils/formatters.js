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
  return xp.toLocaleString("en-US");
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
