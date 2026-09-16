package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import com.rslsolution.speakmateai.dto.request.TeacherProfileUpdateRequest;
import com.rslsolution.speakmateai.dto.response.StudentResponse;
import com.rslsolution.speakmateai.dto.response.TeacherProfileResponse;
import com.rslsolution.speakmateai.dto.response.analytics.StudentProgressProfileResponse;
import com.rslsolution.speakmateai.entity.*;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.impl.StudentProgressAnalyticsServiceImpl;
import com.rslsolution.speakmateai.service.impl.StudentServiceImpl;
import com.rslsolution.speakmateai.service.impl.TeacherServiceImpl;

/**
 * End-to-end verification test for Teacher Name Synchronization requirement:
 * 1. Teacher ID = 25, Name changed from "Rahul Patil" -> "Rahul Sharma" via Teacher Profile.
 * 2. Verify teacher entity keeps same ID = 25 (no duplicate record).
 * 3. Verify student with Assigned Teacher ID = 25 dynamically resolves to "Rahul Sharma" across:
 *    - StudentService (Super Admin & School Admin student list/detail)
 *    - StudentProgressAnalyticsService (Progress & Evaluation Profile)
 */
@ExtendWith(MockitoExtension.class)
public class TeacherNameSyncIntegrationTest {

    @Mock private UserRepository userRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private AdminRepository adminRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private NotificationService notificationService;
    @Mock private ClassRoomRepository classRoomRepository;
    @Mock private ClassStudentRepository classStudentRepository;
    @Mock private TeacherStandardDivisionRepository teacherStandardDivisionRepository;
    @Mock private SettingsRepository settingsRepository;
    @Mock private SchoolRepository schoolRepository;
    @Mock private SchoolTeacherService schoolTeacherService;

    // Analytics repository mocks
    @Mock private ProgressRepository progressRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private SpeakingSessionRepository speakingSessionRepository;
    @Mock private GrammarHistoryRepository grammarHistoryRepository;
    @Mock private VocabularyRepository vocabularyRepository;

    @InjectMocks private TeacherServiceImpl teacherService;
    @InjectMocks private StudentServiceImpl studentService;
    @InjectMocks private StudentProgressAnalyticsServiceImpl analyticsService;

    private Teacher teacherEntity;
    private Student studentEntity;

    @BeforeEach
    void setUp() {
        // Wire dependencies into studentService and analyticsService
        ReflectionTestUtils.setField(studentService, "teacherRepository", teacherRepository);
        ReflectionTestUtils.setField(studentService, "schoolTeacherService", schoolTeacherService);

        // Security Context for Super Admin
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("admin@speakmate.ai");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        Admin superAdmin = Admin.builder()
                .id(1L)
                .email("admin@speakmate.ai")
                .role(Role.SUPER_ADMIN)
                .build();
        lenient().when(adminRepository.findByEmail("admin@speakmate.ai")).thenReturn(Optional.of(superAdmin));

        // Teacher ID = 25, initially "Rahul Patil"
        teacherEntity = Teacher.builder()
                .id(25L)
                .firstName("Rahul")
                .lastName("Patil")
                .email("rahul.patil@school.com")
                .role(Role.TEACHER)
                .active(true)
                .schoolId(10L)
                .schoolName("Springfield Academy")
                .department("English")
                .designation("Senior Teacher")
                .build();

        // Student assigned to Teacher ID = 25
        studentEntity = Student.builder()
                .id(101L)
                .firstName("Aarav")
                .lastName("Sharma")
                .email("aarav.student@school.com")
                .role(Role.STUDENT)
                .schoolId(10L)
                .schoolName("Springfield Academy")
                .standard("8")
                .division("A")
                .rollNumber("12")
                .teacherId(25L)
                .active(true)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now().minusMonths(3))
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Teacher Name Update propagates in-place without duplicate and resolves dynamically for assigned student")
    void testTeacherNameUpdate_ReflectsEverywhereDynamically() {
        // Step 1: Initial state - Student resolves "Rahul Patil"
        when(teacherRepository.findById(25L)).thenReturn(Optional.of(teacherEntity));
        when(studentRepository.findById(101L)).thenReturn(Optional.of(studentEntity));

        StudentResponse initialStudentResponse = studentService.getStudentById(101L);
        assertNotNull(initialStudentResponse);
        assertEquals("Rahul Patil", initialStudentResponse.getAssignedTeacher());
        assertEquals("Rahul Patil", initialStudentResponse.getTeacherName());
        assertEquals(25L, initialStudentResponse.getTeacherId());

        // Step 2: Teacher updates name via Teacher Profile to "Rahul Sharma"
        // Setup authentication as the teacher for profile update
        Authentication teacherAuth = mock(Authentication.class);
        when(teacherAuth.getName()).thenReturn("rahul.patil@school.com");
        SecurityContext teacherSecContext = mock(SecurityContext.class);
        when(teacherSecContext.getAuthentication()).thenReturn(teacherAuth);
        SecurityContextHolder.setContext(teacherSecContext);

        when(teacherRepository.findByEmail("rahul.patil@school.com")).thenReturn(Optional.of(teacherEntity));
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(inv -> inv.getArgument(0));

        TeacherProfileUpdateRequest updateRequest = TeacherProfileUpdateRequest.builder()
                .firstName("Rahul")
                .lastName("Sharma")
                .phone("9876543210")
                .department("English & Literature")
                .build();

        TeacherProfileResponse updateResponse = teacherService.updateProfile(updateRequest);

        // Verification 1: Same Teacher ID, no duplicate record created
        assertEquals(25L, teacherEntity.getId(), "Teacher ID must remain stable (25)");
        assertEquals("Rahul", teacherEntity.getFirstName());
        assertEquals("Sharma", teacherEntity.getLastName());
        assertEquals("Rahul", updateResponse.getIdentity().getFirstName());
        assertEquals("Sharma", updateResponse.getIdentity().getLastName());

        // Step 3: Switch back to Super Admin context to view Student details
        Authentication adminAuth = mock(Authentication.class);
        when(adminAuth.getName()).thenReturn("admin@speakmate.ai");
        SecurityContext adminSecContext = mock(SecurityContext.class);
        when(adminSecContext.getAuthentication()).thenReturn(adminAuth);
        SecurityContextHolder.setContext(adminSecContext);

        // Teacher repository now returns the updated teacher object with "Rahul Sharma"
        when(teacherRepository.findById(25L)).thenReturn(Optional.of(teacherEntity));

        // Verification 2: StudentResponse dynamically reflects the new name "Rahul Sharma"
        StudentResponse updatedStudentResponse = studentService.getStudentById(101L);
        assertNotNull(updatedStudentResponse);
        assertEquals(25L, updatedStudentResponse.getTeacherId(), "Assigned Teacher ID must remain 25");
        assertEquals("Rahul Sharma", updatedStudentResponse.getAssignedTeacher(), "assignedTeacher must dynamically resolve to 'Rahul Sharma'");
        assertEquals("Rahul Sharma", updatedStudentResponse.getTeacherName(), "teacherName must dynamically resolve to 'Rahul Sharma'");

        // Verification 3: StudentProgressAnalyticsService dynamically reflects "Rahul Sharma"
        when(userRepository.findById(101L)).thenReturn(Optional.of(studentEntity));
        when(progressRepository.findByUser(studentEntity)).thenReturn(Optional.empty());
        when(lessonRepository.countByActiveTrue()).thenReturn(20L);
        when(lessonProgressRepository.findByUser(studentEntity)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(studentEntity)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(studentEntity)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(studentEntity)).thenReturn(Collections.emptyList());

        StudentProgressProfileResponse analyticsProfile = analyticsService.getStudentProgressProfile(101L);
        assertNotNull(analyticsProfile);
        assertNotNull(analyticsProfile.getStudent());
        assertEquals("Rahul Sharma", analyticsProfile.getStudent().getTeacherName(), "Analytics student teacherName must resolve to 'Rahul Sharma'");
        assertEquals("Rahul Sharma", analyticsProfile.getStudent().getAssignedTeacher(), "Analytics student assignedTeacher must resolve to 'Rahul Sharma'");
    }
}
