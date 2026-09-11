/**
 * phoneValidator.js
 *
 * Centralized client-side validation and normalization utility
 * for Indian mobile numbers across Super Admin and School Admin modules.
 *
 * Indian Mobile Number Rule:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
 * - Optional +91 prefix with spaces or hyphens
 * - Core regex: ^[6-9]\d{9}$
 * - Full input regex: ^(?:\+91[\s-]?)?[6-9]\d{9}$
 */

export const INDIAN_MOBILE_REGEX = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;
export const NORMALIZED_10_DIGIT_REGEX = /^[6-9]\d{9}$/;

/**
 * Strips whitespace, spaces, and hyphens.
 */
export function cleanPhoneString(phone) {
  if (!phone) return "";
  return String(phone).trim().replace(/[\s-]+/g, "");
}

/**
 * Checks if a string is a valid Indian mobile number.
 */
export function isValidIndianMobile(phone, isRequired = true) {
  if (!phone || !String(phone).trim()) {
    return !isRequired;
  }
  const cleaned = cleanPhoneString(phone);
  return /^(?:\+91)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Normalizes an Indian mobile number to the canonical 10-digit format (e.g. 9876543210).
 * Strips any leading +91, spaces, and hyphens.
 */
export function normalizeIndianMobile(phone) {
  if (!phone) return "";
  let cleaned = cleanPhoneString(phone);
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  }
  return cleaned;
}

/**
 * Returns a human-friendly validation error message or empty string if valid.
 */
export function getIndianMobileError(phone, fieldLabel = "Mobile number", isRequired = true) {
  const trimmed = phone ? String(phone).trim() : "";
  if (!trimmed) {
    return isRequired ? `${fieldLabel} is required.` : "";
  }
  
  if (/[a-zA-Z]/.test(trimmed)) {
    return "Please enter a valid Indian mobile number.";
  }

  const cleaned = cleanPhoneString(trimmed);
  if (!/^(?:\+91)?[6-9]\d{9}$/.test(cleaned)) {
    return "Please enter a valid Indian mobile number.";
  }

  return "";
}

/**
 * Sanitizes input while typing: keeps only digits, optional single leading '+', spaces, and hyphens.
 * Prevents alphabetic and illegal special characters from being typed.
 */
export function sanitizeMobileInput(value) {
  if (!value) return "";
  let val = String(value);
  const startsWithPlus = val.startsWith("+");
  val = val.replace(/[^\d\s-]/g, "");
  if (startsWithPlus) {
    val = "+" + val;
  }
  return val;
}
