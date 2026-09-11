package com.rslsolution.speakmateai.entity;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

public class SchoolAdminEmailVerificationTest {

    @Test
    public void testEmailNormalizationAndLifecycleCallbacks() {
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("  SchoolAdmin@Example.COM  ")
                .otpHash("hashed_otp_sample_value")
                .otpExpiresAt(LocalDateTime.now().plusMinutes(10))
                .createdBy("superadmin@speakmate.com")
                .build();

        assertEquals("  SchoolAdmin@Example.COM  ", verification.getEmail());
        assertEquals(0, verification.getAttemptCount());
        assertFalse(verification.isVerified());
        assertFalse(verification.isTokenConsumed());

        // Trigger PrePersist
        verification.onCreate();

        assertEquals("schooladmin@example.com", verification.getEmail());
        assertNotNull(verification.getCreatedAt());
        assertNotNull(verification.getUpdatedAt());

        // Trigger PreUpdate with uppercase email
        verification.setEmail("  NEW.SchoolAdmin@Example.COM ");
        verification.onUpdate();

        assertEquals("new.schooladmin@example.com", verification.getEmail());
    }

    @Test
    public void testTokenLifecycleFields() {
        LocalDateTime tokenExpiry = LocalDateTime.now().plusHours(24);
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("admin@testschool.edu")
                .verified(true)
                .verificationToken("test-verification-uuid-token")
                .verificationTokenExpiresAt(tokenExpiry)
                .tokenConsumed(false)
                .attemptCount(1)
                .createdBy("superadmin@speakmate.ai")
                .build();

        assertTrue(verification.isVerified());
        assertFalse(verification.isTokenConsumed());
        assertEquals("test-verification-uuid-token", verification.getVerificationToken());
        assertEquals(tokenExpiry, verification.getVerificationTokenExpiresAt());
        assertEquals(1, verification.getAttemptCount());
        assertEquals("superadmin@speakmate.ai", verification.getCreatedBy());

        // Mark consumed
        verification.setTokenConsumed(true);
        assertTrue(verification.isTokenConsumed());
    }
}
