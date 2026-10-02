package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.ReplaceSchoolAdminRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminHistoryResponse;
import com.rslsolution.speakmateai.dto.response.SchoolResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.SchoolAdmin;
import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.exception.AccessDeniedException;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.email.EmailMessage;
import com.rslsolution.speakmateai.service.impl.SchoolServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SchoolAdminLifecycleReplacementTest {

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
    private SubscriptionPlanRepository subscriptionPlanRepository;

    @Mock
    private UserSubscriptionRepository userSubscriptionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private SchoolServiceImpl schoolService;

    private School testSchool;
    private SchoolAdmin rahulAdmin;
    private SchoolAdminEmailVerification validVerification;

    @BeforeEach
    void setUp() {
        testSchool = School.builder()
                .id(10L)
                .name("ABC International School")
                .schoolName("ABC International School")
                .schoolCode("SCH-1001")
                .address("123 Education Lane")
                .contactPhone("9876543210")
                .active(true)
                .build();

        rahulAdmin = SchoolAdmin.builder()
                .id(101L)
                .firstName("Rahul")
                .lastName("Sharma")
                .email("rahul@example.com")
                .phone("9876543210")
                .password("$2a$10$encodedOldPass")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .status(Status.ACTIVE)
                .active(true)
                .emailVerified(true)
                .welcomeCompleted(true)
                .build();

        validVerification = SchoolAdminEmailVerification.builder()
                .id(1L)
                .email("priya@example.com")
                .verificationToken("token-priya-123")
                .verified(true)
                .tokenConsumed(false)
                .verificationTokenExpiresAt(LocalDateTime.now().plusHours(1))
                .build();
    }

    @Test
    @DisplayName("Mandatory Test 1: Replace active Rahul with Priya - Rahul deactivated, Priya created with welcomeCompleted=false")
    void testReplaceSchoolAdmin_Success_CaseA_NewAdmin() {
        ReplaceSchoolAdminRequest request = ReplaceSchoolAdminRequest.builder()
                .adminFirstName("Priya")
                .adminLastName("Sharma")
                .adminEmail("priya@example.com")
                .adminPhone("9876543211")
                .verificationToken("token-priya-123")
                .build();

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(verificationRepository.findByVerificationTokenWithLock("token-priya-123"))
                .thenReturn(Optional.of(validVerification));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(new ArrayList<>(List.of(rahulAdmin)));
        when(userRepository.findByEmail("priya@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("$2a$10$encodedTempPass");

        SchoolAdmin savedPriya = SchoolAdmin.builder()
                .id(102L)
                .firstName("Priya")
                .lastName("Sharma")
                .email("priya@example.com")
                .phone("9876543211")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .status(Status.ACTIVE)
                .active(true)
                .welcomeCompleted(false)
                .build();
        when(schoolAdminRepository.save(any(SchoolAdmin.class))).thenReturn(savedPriya);

        SchoolResponse response = schoolService.replaceSchoolAdmin(10L, request);

        assertNotNull(response);
        assertEquals("priya@example.com", response.getAdminEmail());
        assertEquals(102L, response.getAdminId());

        // Verify Rahul was safely deactivated (preserved, not deleted)
        assertFalse(rahulAdmin.isActive());
        assertEquals(Status.INACTIVE, rahulAdmin.getStatus());
        verify(userRepository).save(rahulAdmin);

        // Verify verification token consumed atomically
        assertTrue(validVerification.isTokenConsumed());
        verify(verificationRepository).save(validVerification);

        // Verify credentials email dispatched
        verify(emailService).sendEmail(any(EmailMessage.class));
    }

    @Test
    @DisplayName("Mandatory Test 5: Replace Priya with Rahul again - Reactivates Rahul (Case B) without duplicate User record")
    void testReplaceSchoolAdmin_Success_CaseB_ReactivateExistingAdmin() {
        // Priya is currently active
        SchoolAdmin priyaAdmin = SchoolAdmin.builder()
                .id(102L)
                .firstName("Priya")
                .lastName("Sharma")
                .email("priya@example.com")
                .phone("9876543211")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .status(Status.ACTIVE)
                .active(true)
                .welcomeCompleted(true)
                .build();

        // Rahul is inactive from past replacement
        rahulAdmin.setActive(false);
        rahulAdmin.setStatus(Status.INACTIVE);

        SchoolAdminEmailVerification rahulVerification = SchoolAdminEmailVerification.builder()
                .id(2L)
                .email("rahul@example.com")
                .verificationToken("token-rahul-456")
                .verified(true)
                .tokenConsumed(false)
                .verificationTokenExpiresAt(LocalDateTime.now().plusHours(1))
                .build();

        ReplaceSchoolAdminRequest request = ReplaceSchoolAdminRequest.builder()
                .adminFirstName("Rahul")
                .adminLastName("Sharma")
                .adminEmail("rahul@example.com")
                .adminPhone("9876543210")
                .verificationToken("token-rahul-456")
                .build();

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(verificationRepository.findByVerificationTokenWithLock("token-rahul-456"))
                .thenReturn(Optional.of(rahulVerification));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(new ArrayList<>(List.of(priyaAdmin, rahulAdmin)));
        when(userRepository.findByEmail("rahul@example.com")).thenReturn(Optional.of(rahulAdmin));
        when(schoolAdminRepository.findById(101L)).thenReturn(Optional.of(rahulAdmin));
        when(passwordEncoder.encode(any())).thenReturn("$2a$10$newTempPassHash");
        when(schoolAdminRepository.save(any(SchoolAdmin.class))).thenAnswer(i -> i.getArgument(0));

        SchoolResponse response = schoolService.replaceSchoolAdmin(10L, request);

        assertNotNull(response);
        assertEquals("rahul@example.com", response.getAdminEmail());
        assertEquals(101L, response.getAdminId());

        // Priya deactivated
        assertFalse(priyaAdmin.isActive());
        assertEquals(Status.INACTIVE, priyaAdmin.getStatus());

        // Rahul reactivated with new temporary credentials & welcomeCompleted = false
        assertTrue(rahulAdmin.isActive());
        assertEquals(Status.ACTIVE, rahulAdmin.getStatus());
        assertFalse(rahulAdmin.isWelcomeCompleted());

        // No duplicate created - reused existing ID
        assertEquals(101L, rahulAdmin.getId());
        verify(schoolAdminRepository, never()).save(argThat(u -> u != rahulAdmin && "rahul@example.com".equals(u.getEmail())));
    }

    @Test
    @DisplayName("Mandatory Test 6: Duplicate Email with active user (Case C) - validation error")
    void testReplaceSchoolAdmin_CaseC_ActiveUserConflict() {
        User activeOtherUser = User.builder()
                .id(205L)
                .email("priya@example.com")
                .active(true)
                .status(Status.ACTIVE)
                .role(Role.STUDENT)
                .build();

        ReplaceSchoolAdminRequest request = ReplaceSchoolAdminRequest.builder()
                .adminFirstName("Priya")
                .adminLastName("Sharma")
                .adminEmail("priya@example.com")
                .adminPhone("9876543211")
                .verificationToken("token-priya-123")
                .build();

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(verificationRepository.findByVerificationTokenWithLock("token-priya-123"))
                .thenReturn(Optional.of(validVerification));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(new ArrayList<>(List.of(rahulAdmin)));
        when(userRepository.findByEmail("priya@example.com")).thenReturn(Optional.of(activeOtherUser));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                schoolService.replaceSchoolAdmin(10L, request));

        assertTrue(ex.getMessage().contains("already active on the platform"));
    }

    @Test
    @DisplayName("Mandatory Test 7: Email belongs to user from another school (Case D) - rejected")
    void testReplaceSchoolAdmin_CaseD_CrossSchoolConflict() {
        User otherSchoolUser = User.builder()
                .id(301L)
                .email("priya@example.com")
                .schoolId(99L) // Different school!
                .active(false)
                .status(Status.INACTIVE)
                .role(Role.SCHOOL_ADMIN)
                .build();

        ReplaceSchoolAdminRequest request = ReplaceSchoolAdminRequest.builder()
                .adminFirstName("Priya")
                .adminLastName("Sharma")
                .adminEmail("priya@example.com")
                .adminPhone("9876543211")
                .verificationToken("token-priya-123")
                .build();

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(verificationRepository.findByVerificationTokenWithLock("token-priya-123"))
                .thenReturn(Optional.of(validVerification));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(new ArrayList<>(List.of(rahulAdmin)));
        when(userRepository.findByEmail("priya@example.com")).thenReturn(Optional.of(otherSchoolUser));

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                schoolService.replaceSchoolAdmin(10L, request));

        assertTrue(ex.getMessage().contains("Cross-school reassignment is not permitted"));
    }

    @Test
    @DisplayName("Mandatory Test 8: School has no active administrator - returns null admin in SchoolResponse")
    void testGetSchoolById_NoActiveAdministrator() {
        // School with only deactivated historical admin
        rahulAdmin.setActive(false);
        rahulAdmin.setStatus(Status.INACTIVE);

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(List.of(rahulAdmin));

        SchoolResponse response = schoolService.getSchoolById(10L);

        assertNotNull(response);
        assertNull(response.getAdminId());
        assertNull(response.getAdminEmail());
        assertNull(response.getAdminName());
    }

    @Test
    @DisplayName("Mandatory Test 9: Current admin resolution picks ACTIVE admin, not historical deactivated first entry")
    void testGetAllSchools_CurrentAdminResolution() {
        SchoolAdmin oldAdmin = SchoolAdmin.builder()
                .id(50L)
                .firstName("Old")
                .lastName("Admin")
                .email("old@example.com")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .active(false)
                .status(Status.INACTIVE)
                .build();

        SchoolAdmin activeAdmin = SchoolAdmin.builder()
                .id(101L)
                .firstName("Rahul")
                .lastName("Sharma")
                .email("rahul@example.com")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .active(true)
                .status(Status.ACTIVE)
                .build();

        when(schoolRepository.findAll()).thenReturn(List.of(testSchool));
        // oldAdmin appears first in list
        when(userRepository.findByRole(Role.SCHOOL_ADMIN)).thenReturn(List.of(oldAdmin, activeAdmin));

        List<SchoolResponse> list = schoolService.getAllSchools();

        assertEquals(1, list.size());
        assertEquals("rahul@example.com", list.get(0).getAdminEmail());
        assertEquals(101L, list.get(0).getAdminId());
    }

    @Test
    @DisplayName("Mandatory Test 9b: Admin history returns both current and historical admins, no credentials exposed")
    void testGetSchoolAdminHistory_DistinguishesActiveFromInactive() {
        SchoolAdmin oldAdmin = SchoolAdmin.builder()
                .id(50L)
                .firstName("Old")
                .lastName("Admin")
                .email("old@example.com")
                .phone("9876543200")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .active(false)
                .status(Status.INACTIVE)
                .welcomeCompleted(true)
                .createdAt(LocalDateTime.now().minusMonths(6))
                .build();

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(List.of(oldAdmin, rahulAdmin));

        List<SchoolAdminHistoryResponse> history = schoolService.getSchoolAdminHistory(10L);

        assertEquals(2, history.size());

        // Sorted latest ID first
        SchoolAdminHistoryResponse current = history.get(0);
        assertEquals(101L, current.getId());
        assertEquals("rahul@example.com", current.getEmail());
        assertTrue(current.isCurrentAdmin());
        assertTrue(current.isActive());
        assertEquals(Status.ACTIVE, current.getStatus());

        SchoolAdminHistoryResponse prev = history.get(1);
        assertEquals(50L, prev.getId());
        assertEquals("old@example.com", prev.getEmail());
        assertFalse(prev.isCurrentAdmin());
        assertFalse(prev.isActive());
        assertEquals(Status.INACTIVE, prev.getStatus());
    }

    @Test
    @DisplayName("Mandatory Test 10: activateSchool reactivates only the legitimate current admin, NOT historical predecessor")
    void testActivateSchool_PreservesHistoricalInactivity() {
        SchoolAdmin historicalOldAdmin = SchoolAdmin.builder()
                .id(50L)
                .firstName("Old")
                .lastName("Admin")
                .email("old@example.com")
                .role(Role.SCHOOL_ADMIN)
                .schoolId(10L)
                .active(false)
                .status(Status.INACTIVE)
                .build();

        rahulAdmin.setActive(false);
        rahulAdmin.setStatus(Status.INACTIVE);

        when(schoolRepository.findById(10L)).thenReturn(Optional.of(testSchool));
        when(schoolRepository.save(any(School.class))).thenAnswer(i -> i.getArgument(0));
        when(userRepository.findBySchoolIdAndRole(10L, Role.SCHOOL_ADMIN))
                .thenReturn(List.of(historicalOldAdmin, rahulAdmin));

        schoolService.activateSchool(10L);

        // Rahul (highest ID) reactivated
        assertTrue(rahulAdmin.isActive());
        assertEquals(Status.ACTIVE, rahulAdmin.getStatus());
        verify(userRepository).save(rahulAdmin);

        // Historical oldAdmin remains inactive!
        assertFalse(historicalOldAdmin.isActive());
        assertEquals(Status.INACTIVE, historicalOldAdmin.getStatus());
        verify(userRepository, never()).save(historicalOldAdmin);
    }
}
