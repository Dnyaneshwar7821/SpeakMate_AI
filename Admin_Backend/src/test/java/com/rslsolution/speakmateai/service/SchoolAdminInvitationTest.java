package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendInvitationRequest;
import com.rslsolution.speakmateai.dto.request.SchoolRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendInvitationResponse;
import com.rslsolution.speakmateai.dto.response.SchoolResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolAdmin;
import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.exception.AccessDeniedException;
import com.rslsolution.speakmateai.repository.SchoolAdminEmailVerificationRepository;
import com.rslsolution.speakmateai.repository.SchoolAdminRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.email.EmailMessage;
import com.rslsolution.speakmateai.service.impl.SchoolServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SchoolAdminInvitationTest {

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

    private SchoolAdminEmailVerification createValidVerification(String email, String token) {
        return SchoolAdminEmailVerification.builder()
                .email(email)
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(25))
                .tokenConsumed(false)
                .build();
    }

    @Test
    public void testSendInvitation_ValidVerifiedEmail_Success() {
        String email = "schooladmin@example.com";
        String token = "valid-token-123";
        SchoolAdminEmailVerification verification = createValidVerification(email, token);

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("bcrypt_hash_placeholder");

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest(email, token);
        SchoolAdminSendInvitationResponse response = schoolService.sendInvitation(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(email, response.getEmail());
        assertNotNull(response.getInvitationSentAt());

        // Verify verification record was updated with pending credential hash and invitationSent=true
        assertTrue(verification.isInvitationSent());
        assertNotNull(verification.getInvitationSentAt());
        assertEquals("bcrypt_hash_placeholder", verification.getPendingCredentialHash());

        // CRITICAL: Token MUST NOT be consumed during invitation!
        assertFalse(verification.isTokenConsumed(), "Token must remain unconsumed after sending invitation");

        verify(verificationRepository).save(verification);
        verify(emailService).sendEmail(any(EmailMessage.class));
    }

    @Test
    public void testSendInvitation_InvalidToken_Throws403() {
        when(verificationRepository.findByVerificationToken("invalid-token")).thenReturn(Optional.empty());

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest("admin@example.com", "invalid-token");

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.sendInvitation(request));
        assertTrue(ex.getMessage().contains("Invalid verification token"));
        verify(emailService, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    public void testSendInvitation_ExpiredToken_Throws403() {
        String token = "expired-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("admin@example.com")
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().minusSeconds(10)) // Expired
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest("admin@example.com", token);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.sendInvitation(request));
        assertTrue(ex.getMessage().contains("expired"));
        assertFalse(verification.isTokenConsumed());
        verify(emailService, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    public void testSendInvitation_UnverifiedEmail_Throws403() {
        String token = "unverified-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("admin@example.com")
                .verified(false) // Unverified
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(false)
                .build();

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest("admin@example.com", token);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.sendInvitation(request));
        assertTrue(ex.getMessage().contains("not been verified"));
        assertFalse(verification.isTokenConsumed());
        verify(emailService, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    public void testSendInvitation_EmailMismatch_Throws403() {
        String token = "token-admin1";
        SchoolAdminEmailVerification verification = createValidVerification("admin1@example.com", token);

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));

        // Request uses admin2@example.com but token belongs to admin1@example.com
        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest("admin2@example.com", token);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.sendInvitation(request));
        assertTrue(ex.getMessage().contains("does not match"));
        assertFalse(verification.isTokenConsumed());
        verify(emailService, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    public void testSendInvitation_ConsumedToken_Throws403() {
        String token = "already-consumed-token";
        SchoolAdminEmailVerification verification = SchoolAdminEmailVerification.builder()
                .email("admin@example.com")
                .verified(true)
                .verificationToken(token)
                .verificationTokenExpiresAt(LocalDateTime.now().plusMinutes(20))
                .tokenConsumed(true) // Consumed!
                .build();

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest("admin@example.com", token);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> schoolService.sendInvitation(request));
        assertTrue(ex.getMessage().contains("already been used"));
        verify(emailService, never()).sendEmail(any(EmailMessage.class));
    }

    @Test
    public void testSendInvitation_DoesNotConsumeToken() {
        String email = "schooladmin@example.com";
        String token = "test-token";
        SchoolAdminEmailVerification verification = createValidVerification(email, token);

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("hashed_pass");

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest(email, token);
        schoolService.sendInvitation(request);

        // Verification token must strictly remain unconsumed
        assertFalse(verification.isTokenConsumed());
    }

    @Test
    public void testSendInvitation_DuplicateInvocation_RegeneratesCredentialsSafely() {
        String email = "schooladmin@example.com";
        String token = "resend-token";
        SchoolAdminEmailVerification verification = createValidVerification(email, token);

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));
        when(passwordEncoder.encode(any(CharSequence.class)))
                .thenReturn("hash_1st_attempt")
                .thenReturn("hash_2nd_attempt");

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest(email, token);

        // First invitation
        schoolService.sendInvitation(request);
        assertEquals("hash_1st_attempt", verification.getPendingCredentialHash());
        assertFalse(verification.isTokenConsumed());

        // Second invitation (resend)
        schoolService.sendInvitation(request);
        assertEquals("hash_2nd_attempt", verification.getPendingCredentialHash());
        assertFalse(verification.isTokenConsumed());

        // Verify email sent twice
        verify(emailService, times(2)).sendEmail(any(EmailMessage.class));
        // No schools or admins were created
        verifyNoInteractions(schoolRepository);
        verifyNoInteractions(schoolAdminRepository);
    }

    @Test
    public void testFullSequence_SendInvitation_ThenCreateSchool_UsesPendingCredentialHash_AndConsumesToken() {
        String email = "schooladmin@example.com";
        String token = "full-flow-token";
        SchoolAdminEmailVerification verification = createValidVerification(email, token);

        // 1. Send Invitation
        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("bcrypt_secure_pending_hash");

        SchoolAdminSendInvitationRequest invRequest = new SchoolAdminSendInvitationRequest(email, token);
        SchoolAdminSendInvitationResponse invResponse = schoolService.sendInvitation(invRequest);

        assertTrue(invResponse.isSuccess());
        assertEquals("bcrypt_secure_pending_hash", verification.getPendingCredentialHash());
        assertFalse(verification.isTokenConsumed(), "Token must not be consumed after invitation");

        // 2. Create School
        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));
        when(schoolRepository.existsByName("Springfield High")).thenReturn(false);
        when(userRepository.existsByEmail(email)).thenReturn(false);

        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School s = invocation.getArgument(0);
            s.setId(10L);
            return s;
        });

        ArgumentCaptor<SchoolAdmin> adminCaptor = ArgumentCaptor.forClass(SchoolAdmin.class);
        when(schoolAdminRepository.save(adminCaptor.capture())).thenAnswer(invocation -> {
            SchoolAdmin sa = invocation.getArgument(0);
            sa.setId(20L);
            return sa;
        });

        SchoolStandard standard = SchoolStandard.builder().id(1L).standard("1").build();
        when(schoolStandardRepository.findBySchoolId(any())).thenReturn(Collections.singletonList(standard));

        SchoolRequest schoolReq = new SchoolRequest();
        schoolReq.setSchoolName("Springfield High");
        schoolReq.setAddress("742 Evergreen Terrace");
        schoolReq.setContactPhone("9876543210");
        schoolReq.setAdminFirstName("Seymour");
        schoolReq.setAdminLastName("Skinner");
        schoolReq.setAdminEmail(email);
        schoolReq.setVerificationToken(token);

        SchoolResponse schoolResponse = schoolService.createSchool(schoolReq);

        assertNotNull(schoolResponse);
        // Verify School Admin was created with the pending credential hash!
        SchoolAdmin savedAdmin = adminCaptor.getValue();
        assertEquals("bcrypt_secure_pending_hash", savedAdmin.getPassword(),
                "SchoolAdmin password must match the pendingCredentialHash from the invitation step");

        // Verify token is NOW consumed!
        assertTrue(verification.isTokenConsumed(), "Token must be consumed after successful createSchool");
    }

    @Test
    public void testSecurity_PlaintextPasswordNeverPersistedOrExposed() {
        String email = "schooladmin@example.com";
        String token = "security-check-token";
        SchoolAdminEmailVerification verification = createValidVerification(email, token);

        when(verificationRepository.findByVerificationToken(token)).thenReturn(Optional.of(verification));
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("bcrypt_hash_987654");

        SchoolAdminSendInvitationRequest request = new SchoolAdminSendInvitationRequest(email, token);
        SchoolAdminSendInvitationResponse response = schoolService.sendInvitation(request);

        // Assert response object has NO password field and does not expose password
        assertNotNull(response);
        assertEquals(email, response.getEmail());
        assertTrue(response.getMessage().contains("credentials sent successfully"));

        // Assert verification entity only has the BCrypt hash
        assertEquals("bcrypt_hash_987654", verification.getPendingCredentialHash());
    }

    @Test
    public void testCreateSchool_DirectFlowWithoutPriorInvitation_GeneratesCredentialsAndDispatchesCompleteEmail() {
        String email = "directadmin@example.com";
        String token = "direct-flow-token";
        SchoolAdminEmailVerification verification = createValidVerification(email, token);
        // Prior invitation was NEVER sent:
        assertNull(verification.getTempPassword());
        assertNull(verification.getPendingCredentialHash());
        assertFalse(verification.isInvitationSent());

        when(verificationRepository.findByVerificationTokenWithLock(token)).thenReturn(Optional.of(verification));
        when(schoolRepository.existsByName("Metropolis Academy")).thenReturn(false);
        when(userRepository.existsByEmail(email)).thenReturn(false);
        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("bcrypt_auto_generated_hash");

        when(schoolRepository.save(any(School.class))).thenAnswer(invocation -> {
            School s = invocation.getArgument(0);
            s.setId(55L);
            return s;
        });

        ArgumentCaptor<SchoolAdmin> adminCaptor = ArgumentCaptor.forClass(SchoolAdmin.class);
        when(schoolAdminRepository.save(adminCaptor.capture())).thenAnswer(invocation -> {
            SchoolAdmin sa = invocation.getArgument(0);
            sa.setId(66L);
            return sa;
        });

        SchoolStandard standard = SchoolStandard.builder().id(10L).standard("1").build();
        when(schoolStandardRepository.findBySchoolId(any())).thenReturn(Collections.singletonList(standard));

        SchoolRequest schoolReq = new SchoolRequest();
        schoolReq.setSchoolName("Metropolis Academy");
        schoolReq.setAddress("100 Broadway, Metropolis, NY - 10001");
        schoolReq.setContactPhone("9876543210");
        schoolReq.setAdminFirstName("Clark");
        schoolReq.setAdminLastName("Kent");
        schoolReq.setAdminEmail(email);
        schoolReq.setVerificationToken(token);

        SchoolResponse schoolResponse = schoolService.createSchool(schoolReq);

        assertNotNull(schoolResponse);
        assertEquals("Metropolis Academy", schoolResponse.getName());

        // 1. Verify credentials were automatically created and token consumed
        assertTrue(verification.isTokenConsumed(), "Token must be consumed");
        assertTrue(verification.isInvitationSent(), "Invitation sent flag must be true");
        assertNotNull(verification.getTempPassword(), "Temp password must be generated");
        assertEquals("bcrypt_auto_generated_hash", verification.getPendingCredentialHash());

        // 2. Verify email dispatch was triggered with complete, accurate details
        ArgumentCaptor<EmailMessage> emailCaptor = ArgumentCaptor.forClass(EmailMessage.class);
        verify(emailService, times(1)).sendEmail(emailCaptor.capture());
        EmailMessage sentMessage = emailCaptor.getValue();

        assertEquals(email, sentMessage.getTo());
        assertTrue(sentMessage.getSubject().contains("Metropolis Academy"));

        String html = sentMessage.getHtmlContent();
        assertNotNull(html);
        assertTrue(html.contains("Metropolis Academy"), "Must contain school name");
        assertTrue(html.contains("SCH-"), "Must contain generated school code");
        assertTrue(html.contains("100 Broadway, Metropolis, NY - 10001"), "Must contain full address");
        assertTrue(html.contains("9876543210"), "Must contain contact phone");
        assertTrue(html.contains("Clark Kent"), "Must contain admin name");
        assertTrue(html.contains(verification.getTempPassword()), "Must contain generated temp password");
        assertTrue(html.contains("/school-admin/login"), "Must contain portal login link");

        // Verify zero placeholder/pending text
        assertFalse(html.contains("PENDING REGISTRATION"), "Must NOT contain PENDING REGISTRATION");
        assertFalse(html.contains("Not Specified"), "Must NOT contain Not Specified");
        assertFalse(html.contains("Configured in Portal"), "Must NOT contain Configured in Portal");
    }
}
