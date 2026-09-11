package com.rslsolution.speakmateai.util;

import java.util.regex.Pattern;

public final class PhoneNumberUtil {

    // Accepts: 10 digits starting with 6-9, optionally prefixed with +91 (with optional spaces/dashes)
    public static final String INDIAN_MOBILE_REGEX = "^(?:\\+91[\\s-]?)?[6-9]\\d{9}$";
    public static final Pattern INDIAN_MOBILE_PATTERN = Pattern.compile(INDIAN_MOBILE_REGEX);

    // Canonical 10-digit format
    public static final String NORMALIZED_10_DIGIT_REGEX = "^[6-9]\\d{9}$";
    public static final Pattern NORMALIZED_10_DIGIT_PATTERN = Pattern.compile(NORMALIZED_10_DIGIT_REGEX);

    // Regex for Bean Validation (allows empty or valid Indian mobile format)
    public static final String OPTIONAL_INDIAN_MOBILE_REGEX = "^$|^(?:\\+91)?[6-9]\\d{9}$";

    // Regex for Bean Validation (strictly requires valid Indian mobile format, optional +91)
    public static final String REQUIRED_INDIAN_MOBILE_REGEX = "^(?:\\+91)?[6-9]\\d{9}$";

    private PhoneNumberUtil() {}

    /**
     * Checks whether the given phone number string is a valid Indian mobile number.
     */
    public static boolean isValidIndianMobile(String phone) {
        if (phone == null) {
            return false;
        }
        String trimmed = phone.trim();
        return INDIAN_MOBILE_PATTERN.matcher(trimmed).matches();
    }

    /**
     * Normalizes an Indian mobile number by trimming, stripping spaces, hyphens, and any leading +91.
     * Returns the canonical 10-digit number if valid, or the trimmed raw string if invalid.
     */
    public static String normalizeIndianMobile(String phone) {
        if (phone == null) {
            return null;
        }
        String cleaned = phone.trim().replaceAll("[\\s-]+", "");
        if (cleaned.startsWith("+91")) {
            cleaned = cleaned.substring(3);
        }
        return cleaned;
    }

    /**
     * Validates and returns the canonical 10-digit Indian mobile number.
     * Throws IllegalArgumentException if invalid.
     */
    public static String validateAndNormalize(String phone, String fieldName) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        if (!isValidIndianMobile(phone)) {
            String label = (fieldName != null && !fieldName.isEmpty()) ? fieldName : "Mobile number";
            throw new IllegalArgumentException(label + " must be a valid Indian mobile number");
        }
        return normalizeIndianMobile(phone);
    }
}
