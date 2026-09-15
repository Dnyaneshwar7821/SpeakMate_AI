package com.rslsolution.speakmateai.util;

import java.util.regex.Pattern;

public final class ValidationUtils {

    public static final String NAME_REGEX = "^[a-zA-Z\\s'-]{2,40}$";
    public static final Pattern NAME_PATTERN = Pattern.compile(NAME_REGEX);
    public static final String NAME_ERROR_MESSAGE = "Names can only contain letters and must be at least 2 characters.";

    private ValidationUtils() {
        // Private constructor for utility class
    }

    public static void validateName(String name) {
        if (name == null) {
            throw new IllegalArgumentException(NAME_ERROR_MESSAGE);
        }
        String trimmed = name.trim();
        if (trimmed.length() < 2 || trimmed.length() > 40 || !NAME_PATTERN.matcher(trimmed).matches() || !trimmed.matches(".*[a-zA-Z].*")) {
            throw new IllegalArgumentException(NAME_ERROR_MESSAGE);
        }
    }

    public static boolean isValidName(String name) {
        if (name == null) {
            return false;
        }
        String trimmed = name.trim();
        return trimmed.length() >= 2
                && trimmed.length() <= 40
                && NAME_PATTERN.matcher(trimmed).matches()
                && trimmed.matches(".*[a-zA-Z].*");
    }
}
