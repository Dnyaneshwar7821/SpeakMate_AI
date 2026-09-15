export const NAME_REGEX = /^[a-zA-Z\s'-]{2,40}$/;
export const NAME_VALIDATION_ERROR = 'Names can only contain letters and must be at least 2 characters.';

export const validateName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;
  if (!NAME_REGEX.test(trimmed)) return false;
  if (!/[a-zA-Z]/.test(trimmed)) return false;
  return true;
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_VALIDATION_ERROR = 'Please enter a valid email address.';

export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return EMAIL_REGEX.test(normalized);
};

export const validateEmail = isValidEmail;

