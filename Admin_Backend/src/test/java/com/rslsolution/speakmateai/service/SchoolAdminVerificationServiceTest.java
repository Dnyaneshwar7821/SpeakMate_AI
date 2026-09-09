package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendOtpRequest;
import com.rslsolution.speakmateai.dto.request.SchoolAdminVerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendOtpResponse;
import com.rslsolution.speakmateai.dto.response.SchoolAdminVerifyOtpResponse;
import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;
import com.rslsolution.speakmateai.repository.SchoolAdminEmailVerificationRepository;
import com.rslsolution.speakmateai.service.email.EmailMessage;
import com.rslsolution.speakmateai.service.impl.SchoolAdminVerificationServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SchoolAdminVerificationServiceTest {

    @Mock
    private SchoolAdminEmailVerificationRepository verificationRepository;

    @Mock
    private EmailService emailService;

    private PasswordEncoder passwordEncoder;
    private SchoolAdminVerificationServiceImpl verificationService;

    @BeforeEach
    public void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        verificationService = new SchoolAdminVerificationServiceImpl(verificationRepository, emailService, passwordEncoder);
    }

    @Test
    public void testSendOtp_NewEmail_Success() {
        String inputEmail = "  SchoolAdmin@Example.COM  ";
        String normalizedEmail = "schooladmin@example.com";

        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.empty());

        SchoolAdminSendOtpRequest request = SchoolAdminSendOtpRequest.builder()
                .email(inputEmail)
                .build();

        SchoolAdminSendOtpResponse response = verificationService.sendOtp(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(normalizedEmail, response.getEmail());
        assertNotNull(response.getExpiresAt());

        // Verify repository save
        ArgumentCaptor<SchoolAdminEmailVerification> captor = ArgumentCaptor.forClass(SchoolAdminEmailVerification.class);
        verify(verificationRepository).save(captor.capture());
        SchoolAdminEmailVerification saved = captor.getValue();

        assertEquals(normalizedEmail, saved.getEmail());
        assertNotNull(saved.getOtpHash());
        // Verify OTP hash is not a 6-digit plaintext number
        assertNotEquals(6, saved.getOtpHash().length());
        assertTrue(saved.getOtpHash().startsWith("$2a$") || saved.getOtpHash().startsWith("$2b$"));
        assertEquals(0, saved.getAttemptCount());
        assertFalse(saved.isVerified());
        assertNull(saved.getVerificationToken());

        // Verify email dispatched
        ArgumentCaptor<EmailMessage> emailCaptor = ArgumentCaptor.forClass(EmailMessage.class);
        verify(emailService).sendEmail(emailCaptor.capture());
        EmailMessage sentMessage = emailCaptor.getValue();

        assertEquals(normalizedEmail, sentMessage.getTo());
        assertTrue(sentMessage.getSubject().contains("School Admin Verification OTP"));
        assertTrue(sentMessage.getHtmlContent().contains("SpeakMate AI"));
    }

    @Test
    public void testSendOtp_ExistingEmail_Resend_InvalidatesPrevious() {
        String normalizedEmail = "existing.admin@school.org";

        SchoolAdminEmailVerification existing = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .otpHash("old_hash")
                .otpExpiresAt(LocalDateTime.now().minusMinutes(5))
                .attemptCount(3)
                .verified(true)
                .verificationToken("old_token_123")
                .verificationTokenExpiresAt(LocalDateTime.now().plusHours(1))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(existing));

        SchoolAdminSendOtpRequest request = SchoolAdminSendOtpRequest.builder()
                .email(normalizedEmail)
                .build();

        SchoolAdminSendOtpResponse response = verificationService.sendOtp(request);

        assertTrue(response.isSuccess());
        assertEquals(0, existing.getAttemptCount());
        assertFalse(existing.isVerified());
        assertNull(existing.getVerificationToken());
        assertNull(existing.getVerificationTokenExpiresAt());
        assertNotEquals("old_hash", existing.getOtpHash());
        verify(verificationRepository).save(existing);
    }

    @Test
    public void testSendOtp_EmailServiceFailure_ThrowsException() {
        String normalizedEmail = "admin@fail.com";
        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.empty());
        doThrow(new RuntimeException("Mail server down")).when(emailService).sendEmail(any(EmailMessage.class));

        SchoolAdminSendOtpRequest request = SchoolAdminSendOtpRequest.builder()
                .email(normalizedEmail)
                .build();

        RuntimeException ex = assertThrows(RuntimeException.class, () -> verificationService.sendOtp(request));
        assertTrue(ex.getMessage().contains("Failed to send verification email"));
    }

    @Test
    public void testVerifyOtp_Success() {
        String normalizedEmail = "schooladmin@example.com";
        String rawOtp = "482915";
        String hashedOtp = passwordEncoder.encode(rawOtp);

        SchoolAdminEmailVerification record = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .otpHash(hashedOtp)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(8))
                .attemptCount(0)
                .verified(false)
                .build();

        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(record));

        SchoolAdminVerifyOtpRequest request = SchoolAdminVerifyOtpRequest.builder()
                .email("  SchoolAdmin@Example.COM  ")
                .otp(rawOtp)
                .build();

        SchoolAdminVerifyOtpResponse response = verificationService.verifyOtp(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(normalizedEmail, response.getVerifiedEmail());
        assertNotNull(response.getVerificationToken());
        assertTrue(response.getVerificationToken().length() >= 32);
        assertNotNull(response.getExpiresAt());

        // Assert record state after successful verification
        assertTrue(record.isVerified());
        assertFalse(record.isTokenConsumed());
        assertEquals(response.getVerificationToken(), record.getVerificationToken());
        // OTP must be invalidated to prevent reuse
        assertNull(record.getOtpHash());
        assertNull(record.getOtpExpiresAt());

        verify(verificationRepository).save(record);
    }

    @Test
    public void testVerifyOtp_IncorrectOtp_IncrementsAttempts() {
        String normalizedEmail = "schooladmin@example.com";
        String hashedOtp = passwordEncoder.encode("123456");

        SchoolAdminEmailVerification record = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .otpHash(hashedOtp)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(5))
                .attemptCount(0)
                .verified(false)
                .build();

        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(record));

        SchoolAdminVerifyOtpRequest request = SchoolAdminVerifyOtpRequest.builder()
                .email(normalizedEmail)
                .otp("999999")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> verificationService.verifyOtp(request));
        assertTrue(ex.getMessage().contains("Invalid OTP code"));
        assertEquals(1, record.getAttemptCount());
        verify(verificationRepository).save(record);
    }

    @Test
    public void testVerifyOtp_MaxAttemptsExceeded() {
        String normalizedEmail = "schooladmin@example.com";
        SchoolAdminEmailVerification record = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .otpHash(passwordEncoder.encode("123456"))
                .otpExpiresAt(LocalDateTime.now().plusMinutes(5))
                .attemptCount(5)
                .build();

        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(record));

        SchoolAdminVerifyOtpRequest request = SchoolAdminVerifyOtpRequest.builder()
                .email(normalizedEmail)
                .otp("123456")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> verificationService.verifyOtp(request));
        assertTrue(ex.getMessage().contains("Maximum verification attempts exceeded"));
    }

    @Test
    public void testVerifyOtp_ExpiredOtp() {
        String normalizedEmail = "schooladmin@example.com";
        SchoolAdminEmailVerification record = SchoolAdminEmailVerification.builder()
                .email(normalizedEmail)
                .otpHash(passwordEncoder.encode("123456"))
                .otpExpiresAt(LocalDateTime.now().minusSeconds(1))
                .attemptCount(0)
                .build();

        when(verificationRepository.findByEmail(normalizedEmail)).thenReturn(Optional.of(record));

        SchoolAdminVerifyOtpRequest request = SchoolAdminVerifyOtpRequest.builder()
                .email(normalizedEmail)
                .otp("123456")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> verificationService.verifyOtp(request));
        assertTrue(ex.getMessage().contains("OTP has expired"));
    }

    @Test
    public void testVerifyOtp_NonExistentRecord() {
        when(verificationRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        SchoolAdminVerifyOtpRequest request = SchoolAdminVerifyOtpRequest.builder()
                .email("nonexistent@example.com")
                .otp("123456")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> verificationService.verifyOtp(request));
        assertTrue(ex.getMessage().contains("No verification request found"));
    }
}
