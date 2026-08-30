export const getDisplayName = (user) => {
  if (!user) return 'Learner';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Learner';
};

export const parseIsoDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  let str = String(value).trim();
  if (str.includes('T') && !str.endsWith('Z') && !str.includes('+') && !str.match(/-\d{2}:\d{2}$/)) {
    str = `${str}Z`;
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? new Date(value) : d;
};

export const formatRelativeTime = (value) => {
  if (!value) return 'Just now';
  try {
    const date = parseIsoDate(value);
    if (!date || Number.isNaN(date.getTime())) return 'Just now';

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;

    const isSameDay =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (diffHours < 24 && isSameDay) {
      return `${diffHours}h ago`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Just now';
  }
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = parseIsoDate(value);
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
};

export const compactNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString() : '0';
};

