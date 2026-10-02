/**
 * phoneValidator.js
 *
 * Centralized client-side validation, sanitization, and formatting utility
 * for Indian mobile numbers across Super Admin, School Admin, and Teacher modules.
 *
 * Indian Mobile Number Rules:
 * - Strictly numbers only (no letters, spaces, or special characters)
 * - Maximum & exact 10 digits (cannot exceed 10 digits)
 * - Must start with 6, 7, 8, or 9 (standard Indian mobile prefixes)
 * - Optional +91 prefix accepted on paste and normalized to 10 digits
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
 * Checks if a string is a valid Indian mobile number:
 * - Exactly 10 digits
 * - Starts with 6, 7, 8, or 9
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
 * Strips any leading +91, spaces, hyphens, and non-digits.
 */
export function normalizeIndianMobile(phone) {
  if (!phone) return "";
  let cleaned = cleanPhoneString(phone);
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  }
  return cleaned.replace(/\D/g, "").slice(0, 10);
}

/**
 * Returns a human-friendly validation error message or empty string if valid.
 * Provides clear reasons:
 * 1. Required check
 * 2. Numbers only check (no alphanumeric or special characters)
 * 3. Starting digit check (must start with 6, 7, 8, or 9)
 * 4. 10-digit length check
 */
export function getIndianMobileError(phone, fieldLabel = "Mobile number", isRequired = true) {
  const trimmed = phone ? String(phone).trim() : "";
  if (!trimmed) {
    return isRequired ? `${fieldLabel} is required.` : "";
  }
  
  // Non-numeric check
  if (/[a-zA-Z]/.test(trimmed)) {
    return `${fieldLabel} must contain numbers only (no alphabetic characters).`;
  }
  if (/[^\d+ -]/.test(trimmed)) {
    return `${fieldLabel} must contain numbers only (no special characters).`;
  }

  const digits = normalizeIndianMobile(trimmed);
  if (!digits) {
    return isRequired ? `${fieldLabel} is required.` : "";
  }

  // Must start with 6, 7, 8, or 9
  if (!/^[6-9]/.test(digits)) {
    return `${fieldLabel} must start with 6, 7, 8, or 9.`;
  }

  // Length check
  if (digits.length < 10) {
    return `${fieldLabel} must be exactly 10 digits (${digits.length}/10 digits entered).`;
  }

  if (digits.length > 10) {
    return `10-digit limit reached. Mobile number cannot exceed 10 digits.`;
  }

  return "";
}

/**
 * Sanitizes input while typing:
 * - Strips any leading +91 prefix
 * - Strips all non-digit characters (strict numeric only)
 * - Clamps strictly to a maximum of 10 digits (cannot exceed 10 digits)
 */
export function sanitizeMobileInput(value, maxLength = 10) {
  if (!value) return "";
  let val = String(value).trim();
  if (val.startsWith("+91")) {
    val = val.slice(3);
  }
  // Keep strictly digits 0-9
  val = val.replace(/\D/g, "");
  // Strictly enforce digit limit
  return val.slice(0, maxLength);
}

/**
 * Returns real-time typing feedback / limit status for UI indicators.
 */
export function getMobileInputStatus(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 0) return null;

  if (!/^[6-9]/.test(digits)) {
    return {
      type: "error",
      message: "Must start with 6, 7, 8, or 9",
      count: digits.length,
      isLimit: false,
    };
  }

  if (digits.length === 10) {
    return {
      type: "limit",
      message: "10-digit limit reached (cannot exceed 10 digits)",
      count: 10,
      isLimit: true,
    };
  }

  return {
    type: "progress",
    message: `${digits.length}/10 digits (${10 - digits.length} remaining)`,
    count: digits.length,
    isLimit: false,
  };
}
