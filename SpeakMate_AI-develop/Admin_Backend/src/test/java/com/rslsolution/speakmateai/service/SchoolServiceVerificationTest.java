package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import com.rslsolution.speakmateai.entity.SchoolStandard;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.SchoolRequest;
import com.rslsolution.speakmateai.dto.response.SchoolResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolAdmin;
import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;
import com.rslsolution.speakmateai.exception.AccessDeniedException;
import com.rslsolution.speakmateai.repository.SchoolAdminEmailVerificationRepository;
import com.rslsolution.speakmateai.repository.SchoolAdminRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.SchoolServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SchoolServiceVerificationTest {

    @Mock
    private SchoolRepository schoolRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private SchoolAdminRepository schoolAdminRepository;
    @Mock
    private SchoolStandardRepository schoolStandardRepository;
    @Mock
    private StandardDivisionRepository standardDivisionRepository;
    @Mock
    private SchoolAdminEmailVerificationRepository verificationRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private EmailService emailService;
    @Mock
    private NotificationService notificationService;

    private SchoolServiceImpl schoolService;

    @BeforeEach
    public void setUp() {
        schoolService = new SchoolServiceImpl(
                schoolRepository,
                userRepository,
                schoolAdminRepository,
                schoolStandardRepository,
                standardDivisionRepository,
                verificationRepository,
                passwordEncoder,
                emailService,
                notificationService
        );
    }

    private SchoolRequest createSampleRequest(String token, String email) {
        SchoolRequest request = new SchoolRequest();
        request.setSchoolName("Greenwood High");
        request.setAddress("123 Main St");
        request.setContactPhone("9876543210");
        request.setAdminFirstName("Jane");
        request.setAdminLastName("Doe");
        request.setAdminEmail(email);
        request.setVerificationToken(token);
        return request;
    }

    private void mockStandardSetup() {
        SchoolStandard standard = SchoolStandard.builder().id(1L).standard("1").build();
        when(schoolStandardRepository.findBySchoolId(any())).thenReturn(Collections.singletonList(standard));
    }

    @Test
    public void testCreateSchool_ValidVerifiedToken_Success() {
        String token = "valid-secure-token-123";
        String normalizedEmail = "schooladmin@example.com";

        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(25))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));
        when(schoolRepository.existsByName("Greenwood High")).thenReturn(false);
        when(userRepository.existsByEmail(normalizedEmail)).thenReturn(false);

        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(schoolAdminRepository.save(any(SchoolAdmin.class))).thenAnswer(invocation -> {
            SchoolAdmin sa = invocation.getArgument(0);
            sa.setId(100L);
            return sa;
        });
        mockStandardSetup();

        SchoolRequest request = createSampleRequest(token, normalizedEmail);
        SchoolResponse response = schoolService.createSchool(request);

        assertNotNull(response);
        assertEquals("Greenwood High", response.getName());
        assertTrue(verification.isTokenConsumed());
        verify(verificationRepository).save(verification);
        verify(schoolRepository).save(any(School.class));
        verify(schoolAdminRepository).save(any(SchoolAdmin.class));
    }

    @Test
    public void testCreateSchool_MissingToken_Rejected() {
        SchoolRequest request = createSampleRequest(null, "schooladmin@example.com");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("verification token is required"));
        verifyNoInteractions(schoolRepository);
        verifyNoInteractions(schoolAdminRepository);
    }

    @Test
    public void testCreateSchool_InvalidToken_Rejected() {
        when(verificationRepository.findByVerificationTokenWithLock("invalid-token")).thenReturn(Optional.empty());

        SchoolRequest request = createSampleRequest("invalid-token", "schooladmin@example.com");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("Invalid verification token"));
        verifyNoInteractions(schoolRepository);
        verifyNoInteractions(schoolAdminRepository);
    }

    @Test
    public void testCreateSchool_UnverifiedEmail_Rejected() {
        String token = "unverified-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("schooladmin@example.com")
                .verified(false) // Not verified yet!
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));

        SchoolRequest request = createSampleRequest(token, "schooladmin@example.com");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("email has not been verified"));
        assertFalse(verification.isTokenConsumed());
        verifyNoInteractions(schoolRepository);
    }

    @Test
    public void testCreateSchool_ExpiredToken_Rejected() {
        String token = "expired-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("schooladmin@example.com")
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().minusSeconds(5)) // Expired
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));

        SchoolRequest request = createSampleRequest(token, "schooladmin@example.com");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("token has expired"));
        assertFalse(verification.isTokenConsumed());
        verifyNoInteractions(schoolRepository);
    }

    @Test
    public void testCreateSchool_ConsumedToken_Rejected() {
        String token = "already-consumed-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("schooladmin@example.com")
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(true) // Already used!
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));

        SchoolRequest request = createSampleRequest(token, "schooladmin@example.com");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("already been used"));
        verifyNoInteractions(schoolRepository);
    }

    @Test
    public void testCreateSchool_EmailMismatch_Rejected() {
        String token = "valid-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("verified.admin@example.com")
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));

        // Request supplies a DIFFERENT email
        SchoolRequest request = createSampleRequest(token, "different.admin@example.com");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("does not match the provided admin email"));
        assertFalse(verification.isTokenConsumed());
        verifyNoInteractions(schoolRepository);
    }

    @Test
    public void testCreateSchool_CaseInsensitiveEmailMatch_Success() {
        String token = "case-test-token";
        String normalizedEmail = "schooladmin@example.com";

        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));
        when(schoolRepository.existsByName("Greenwood High")).thenReturn(false);
        when(userRepository.existsByEmail(normalizedEmail)).thenReturn(false);
        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(schoolAdminRepository.save(any(SchoolAdmin.class))).thenAnswer(invocation -> {
            SchoolAdmin sa = invocation.getArgument(0);
            sa.setId(100L);
            return sa;
        });
        mockStandardSetup();

        // Email in request has mixed case and surrounding whitespace
        SchoolRequest request = createSampleRequest(token, "  SchoolAdmin@Example.COM  ");

        SchoolResponse response = schoolService.createSchool(request);
        assertNotNull(response);
        assertTrue(verification.isTokenConsumed());
        verify(verificationRepository).save(verification);
    }

    @Test
    public void testCreateSchool_ReplayProtection_SecondAttemptRejected() {
        String token = "replay-token-123";
        String normalizedEmail = "schooladmin@example.com";

        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(25))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));
        when(schoolRepository.existsByName("Greenwood High")).thenReturn(false);
        when(userRepository.existsByEmail(normalizedEmail)).thenReturn(false);

        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(schoolAdminRepository.save(any(SchoolAdmin.class))).thenAnswer(invocation -> {
            SchoolAdmin sa = invocation.getArgument(0);
            sa.setId(100L);
            return sa;
        });
        mockStandardSetup();

        SchoolRequest request = createSampleRequest(token, normalizedEmail);

        // 1st attempt: Should succeed and mark token consumed
        SchoolResponse response = schoolService.createSchool(request);
        assertNotNull(response);
        assertTrue(verification.isTokenConsumed());

        // 2nd attempt with SAME token: Must be rejected because token is now consumed
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("already been used"));
    }

    @Test
    public void testCreateSchool_DuplicateSchoolName_TokenNotConsumed() {
        String token = "rollback-test-token";
        String normalizedEmail = "schooladmin@example.com";

        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));
        when(schoolRepository.existsByName("Greenwood High")).thenReturn(true); // Duplicate!

        SchoolRequest request = createSampleRequest(token, normalizedEmail);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> schoolService.createSchool(request));
        assertTrue(ex.getMessage().contains("already exists"));
        // Token must NOT be consumed
        assertFalse(verification.isTokenConsumed());
        verify(schoolAdminRepository, never()).save(any(SchoolAdmin.class));
    }
}
