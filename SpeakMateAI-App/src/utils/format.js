export const getDisplayName = (user) => {
  if (!user) return 'Learner';
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email || 'Learner';
};

export const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString();
};

export const compactNumber = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString() : '0';
};
