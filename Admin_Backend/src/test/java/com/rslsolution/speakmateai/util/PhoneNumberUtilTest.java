package com.rslsolution.speakmateai.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PhoneNumberUtilTest {

    @Test
    void testValid10DigitNumbers() {
        assertTrue(PhoneNumberUtil.isValidIndianMobile("9876543210"));
        assertTrue(PhoneNumberUtil.isValidIndianMobile("8876543210"));
        assertTrue(PhoneNumberUtil.isValidIndianMobile("7876543210"));
        assertTrue(PhoneNumberUtil.isValidIndianMobile("6876543210"));
    }

    @Test
    void testValidCountryCodeNumbers() {
        assertTrue(PhoneNumberUtil.isValidIndianMobile("+919876543210"));
        assertTrue(PhoneNumberUtil.isValidIndianMobile("+91 9876543210"));
        assertTrue(PhoneNumberUtil.isValidIndianMobile("+91-9876543210"));
    }

    @Test
    void testNormalization() {
        assertEquals("9876543210", PhoneNumberUtil.normalizeIndianMobile("9876543210"));
        assertEquals("9876543210", PhoneNumberUtil.normalizeIndianMobile("+919876543210"));
        assertEquals("9876543210", PhoneNumberUtil.normalizeIndianMobile("+91 9876543210"));
        assertEquals("9876543210", PhoneNumberUtil.normalizeIndianMobile("+91-9876543210"));
        assertEquals("9876543210", PhoneNumberUtil.normalizeIndianMobile("  +91 98765-43210  "));
    }

    @Test
    void testInvalidNumbers() {
        // Starts with 5
        assertFalse(PhoneNumberUtil.isValidIndianMobile("5876543210"));
        // 9 digits
        assertFalse(PhoneNumberUtil.isValidIndianMobile("987654321"));
        // 11 digits
        assertFalse(PhoneNumberUtil.isValidIndianMobile("98765432101"));
        // Contains letters
        assertFalse(PhoneNumberUtil.isValidIndianMobile("98765abc10"));
        // Contains invalid country code
        assertFalse(PhoneNumberUtil.isValidIndianMobile("+19876543210"));
        // Empty / null
        assertFalse(PhoneNumberUtil.isValidIndianMobile(""));
        assertFalse(PhoneNumberUtil.isValidIndianMobile(null));
    }

    @Test
    void testValidateAndNormalizeSuccess() {
        assertEquals("9876543210", PhoneNumberUtil.validateAndNormalize("9876543210", "Phone"));
        assertEquals("9876543210", PhoneNumberUtil.validateAndNormalize("+91 9876543210", "Phone"));
        assertEquals("9876543210", PhoneNumberUtil.validateAndNormalize("+919876543210", "Phone"));
        assertNull(PhoneNumberUtil.validateAndNormalize(null, "Phone"));
        assertNull(PhoneNumberUtil.validateAndNormalize("", "Phone"));
        assertNull(PhoneNumberUtil.validateAndNormalize("   ", "Phone"));
    }

    @Test
    void testValidateAndNormalizeThrowsOnInvalid() {
        assertThrows(IllegalArgumentException.class, () -> 
            PhoneNumberUtil.validateAndNormalize("5876543210", "Phone")
        );
        assertThrows(IllegalArgumentException.class, () -> 
            PhoneNumberUtil.validateAndNormalize("98765abc10", "Phone")
        );
        assertThrows(IllegalArgumentException.class, () -> 
            PhoneNumberUtil.validateAndNormalize("987654321", "Phone")
        );
        assertThrows(IllegalArgumentException.class, () -> 
            PhoneNumberUtil.validateAndNormalize("98765432101", "Phone")
        );
    }

    @Test
    void testBeanValidationRegexPatterns() {
        // REQUIRED_INDIAN_MOBILE_REGEX: ^(?:\+91)?[6-9]\d{9}$
        assertTrue("9876543210".matches(PhoneNumberUtil.REQUIRED_INDIAN_MOBILE_REGEX));
        assertTrue("+919876543210".matches(PhoneNumberUtil.REQUIRED_INDIAN_MOBILE_REGEX));
        assertFalse("5876543210".matches(PhoneNumberUtil.REQUIRED_INDIAN_MOBILE_REGEX));
        assertFalse("".matches(PhoneNumberUtil.REQUIRED_INDIAN_MOBILE_REGEX));

        // OPTIONAL_INDIAN_MOBILE_REGEX: ^$|^(?:\+91)?[6-9]\d{9}$
        assertTrue("".matches(PhoneNumberUtil.OPTIONAL_INDIAN_MOBILE_REGEX));
        assertTrue("9876543210".matches(PhoneNumberUtil.OPTIONAL_INDIAN_MOBILE_REGEX));
        assertTrue("+919876543210".matches(PhoneNumberUtil.OPTIONAL_INDIAN_MOBILE_REGEX));
        assertFalse("5876543210".matches(PhoneNumberUtil.OPTIONAL_INDIAN_MOBILE_REGEX));
        assertFalse("987654321".matches(PhoneNumberUtil.OPTIONAL_INDIAN_MOBILE_REGEX));
    }
}
