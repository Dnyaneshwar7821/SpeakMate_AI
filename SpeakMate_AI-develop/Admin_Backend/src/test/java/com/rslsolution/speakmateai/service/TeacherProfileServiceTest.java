package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.ChangePasswordRequest;
import com.rslsolution.speakmateai.dto.request.TeacherProfileUpdateRequest;
import com.rslsolution.speakmateai.dto.response.TeacherProfileResponse;
import com.rslsolution.speakmateai.entity.*;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.impl.TeacherServiceImpl;

@ExtendWith(MockitoExtension.class)
public class TeacherProfileServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private StudentRepository studentRepository;
    @Mock private AdminRepository adminRepository;
    @Mock private ClassRoomRepository classRoomRepository;
    @Mock private ClassStudentRepository classStudentRepository;
    @Mock private TeacherStandardDivisionRepository teacherStandardDivisionRepository;
    @Mock private ProgressRepository progressRepository;
    @Mock private SpeakingSessionRepository speakingSessionRepository;
    @Mock private GrammarHistoryRepository grammarHistoryRepository;
    @Mock private VocabularyRepository vocabularyRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private AchievementRepository achievementRepository;
    @Mock private SettingsRepository settingsRepository;
    @Mock private SchoolRepository schoolRepository;

    @InjectMocks
    private TeacherServiceImpl teacherService;

    private Teacher mockTeacher;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("teacher@school.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        mockTeacher = Teacher.builder()
                .id(101L)
                .firstName("John")
                .lastName("Doe")
                .email("teacher@school.com")
                .password("encoded_secret_pass")
                .phone("9876543210")
                .role(Role.TEACHER)
                .active(true)
                .schoolId(5L)
                .schoolName("Greenwood High")
                .employeeId("EMP-001")
                .department("Mathematics")
                .designation("Senior Lecturer")
                .qualification("M.Sc. Mathematics, B.Ed.")
                .experience("7 years")
                .location("Mumbai, Maharashtra")
                .bio("Passionate mathematics teacher with 7+ years of experience.")
                .joinedAt(LocalDateTime.of(2022, 6, 1, 10, 0))
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testGetProfile_ReturnsAuthenticDataWithoutHardcoding() {
        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(mockTeacher));
        when(settingsRepository.findByUser(mockTeacher)).thenReturn(Optional.empty());
        when(classRoomRepository.findByTeacherId(101L)).thenReturn(Collections.emptyList());
        when(studentRepository.findByTeacherId(101L)).thenReturn(Collections.emptyList());

        TeacherProfileResponse response = teacherService.getProfile();

        assertNotNull(response);
        assertEquals("John", response.getIdentity().getFirstName());
        assertEquals("Doe", response.getIdentity().getLastName());
        assertEquals("teacher@school.com", response.getIdentity().getEmail());
        assertTrue(response.getIdentity().getActive());

        // Verify professional information matches entity (no fake defaults!)
        assertEquals("EMP-001", response.getProfessionalInfo().getEmployeeId());
        assertEquals("Mathematics", response.getProfessionalInfo().getDepartment());
        assertEquals("Senior Lecturer", response.getProfessionalInfo().getDesignation());
        assertEquals("M.Sc. Mathematics, B.Ed.", response.getProfessionalInfo().getQualification());
        assertEquals("7 years", response.getProfessionalInfo().getExperience());
        assertEquals("Passionate mathematics teacher with 7+ years of experience.", response.getBio());

        // Verify contact and school context
        assertEquals("9876543210", response.getContactInfo().getPhone());
        assertEquals("Mumbai, Maharashtra", response.getContactInfo().getLocation());
        assertEquals(5L, response.getSchoolId());
        assertEquals("Greenwood High", response.getSchoolName());
    }

    @Test
    void testUpdateProfile_UpdatesOnlyAllowedFields() {
        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(mockTeacher));
        when(teacherRepository.save(any(Teacher.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(settingsRepository.findByUser(mockTeacher)).thenReturn(Optional.empty());
        when(classRoomRepository.findByTeacherId(101L)).thenReturn(Collections.emptyList());
        when(studentRepository.findByTeacherId(101L)).thenReturn(Collections.emptyList());

        TeacherProfileUpdateRequest updateRequest = TeacherProfileUpdateRequest.builder()
                .firstName("Jonathan")
                .lastName("Smith")
                .phone("9123456780")
                .department("Science")
                .designation("Head of Science")
                .qualification("Ph.D. Physics")
                .experience("10 years")
                .location("Bangalore, Karnataka")
                .bio("Dedicated physics educator.")
                .build();

        TeacherProfileResponse updatedResponse = teacherService.updateProfile(updateRequest);

        assertNotNull(updatedResponse);
        assertEquals("Jonathan", updatedResponse.getIdentity().getFirstName());
        assertEquals("Smith", updatedResponse.getIdentity().getLastName());
        assertEquals("Science", updatedResponse.getProfessionalInfo().getDepartment());
        assertEquals("Head of Science", updatedResponse.getProfessionalInfo().getDesignation());
        assertEquals("Ph.D. Physics", updatedResponse.getProfessionalInfo().getQualification());
        assertEquals("10 years", updatedResponse.getProfessionalInfo().getExperience());
        assertEquals("Bangalore, Karnataka", updatedResponse.getContactInfo().getLocation());
        assertEquals("Dedicated physics educator.", updatedResponse.getBio());

        // Security check: immutable fields remain untouched
        assertEquals(101L, mockTeacher.getId());
        assertEquals(Role.TEACHER, mockTeacher.getRole());
        assertEquals(5L, mockTeacher.getSchoolId());
        assertEquals("EMP-001", mockTeacher.getEmployeeId());
        assertTrue(mockTeacher.isActive());
    }

    @Test
    void testChangePassword_Success() {
        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(mockTeacher));
        when(passwordEncoder.matches("Current@123", "encoded_secret_pass")).thenReturn(true);
        when(passwordEncoder.encode("NewPassword@123")).thenReturn("new_encoded_hash");

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("Current@123")
                .newPassword("NewPassword@123")
                .confirmPassword("NewPassword@123")
                .build();

        assertDoesNotThrow(() -> teacherService.changePassword(request));
        assertEquals("new_encoded_hash", mockTeacher.getPassword());
        verify(teacherRepository, times(1)).save(mockTeacher);
    }

    @Test
    void testChangePassword_IncorrectCurrentPassword_ThrowsException() {
        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(mockTeacher));
        when(passwordEncoder.matches("Wrong@123", "encoded_secret_pass")).thenReturn(false);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("Wrong@123")
                .newPassword("NewPassword@123")
                .confirmPassword("NewPassword@123")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> teacherService.changePassword(request));
        assertEquals("Current password is incorrect", ex.getMessage());
        verify(teacherRepository, never()).save(any());
    }

    @Test
    void testChangePassword_MismatchedConfirmPassword_ThrowsException() {
        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(mockTeacher));
        when(passwordEncoder.matches("Current@123", "encoded_secret_pass")).thenReturn(true);

        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("Current@123")
                .newPassword("NewPassword@123")
                .confirmPassword("DifferentPassword@123")
                .build();

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> teacherService.changePassword(request));
        assertEquals("New password and confirm password do not match", ex.getMessage());
        verify(teacherRepository, never()).save(any());
    }

    @Test
    void testDownloadProfile_ReturnsJsonBytes() {
        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(mockTeacher));
        when(settingsRepository.findByUser(mockTeacher)).thenReturn(Optional.empty());
        when(classRoomRepository.findByTeacherId(101L)).thenReturn(Collections.emptyList());
        when(studentRepository.findByTeacherId(101L)).thenReturn(Collections.emptyList());

        byte[] jsonBytes = teacherService.downloadProfile();
        assertNotNull(jsonBytes);
        assertTrue(jsonBytes.length > 0);
        String jsonStr = new String(jsonBytes);
        assertTrue(jsonStr.contains("John"));
        assertTrue(jsonStr.contains("Mathematics"));
    }

    @Test
    void testGetProfile_ResolvesSchoolAndStandardWhenInitiallyNull() {
        Teacher teacherWithNullSchool = Teacher.builder()
                .id(202L)
                .firstName("Alice")
                .lastName("Smith")
                .email("teacher@school.com")
                .role(Role.TEACHER)
                .active(true)
                .schoolId(24L)
                .schoolName(null)
                .build();

        School mockSchool = School.builder()
                .id(24L)
                .name("DY Patil University")
                .build();

        SchoolStandard mockStd = SchoolStandard.builder()
                .id(1L)
                .school(mockSchool)
                .standard("6")
                .build();

        StandardDivision mockDiv = StandardDivision.builder()
                .id(1L)
                .schoolStandard(mockStd)
                .division("A")
                .build();

        TeacherStandardDivision mockTsd = TeacherStandardDivision.builder()
                .id(1L)
                .teacher(teacherWithNullSchool)
                .standardDivision(mockDiv)
                .build();

        when(teacherRepository.findByEmail("teacher@school.com")).thenReturn(Optional.of(teacherWithNullSchool));
        when(settingsRepository.findByUser(teacherWithNullSchool)).thenReturn(Optional.empty());
        when(classRoomRepository.findByTeacherId(202L)).thenReturn(Collections.emptyList());
        when(studentRepository.findByTeacherId(202L)).thenReturn(Collections.emptyList());
        when(schoolRepository.findById(24L)).thenReturn(Optional.of(mockSchool));
        when(teacherStandardDivisionRepository.findByTeacherId(202L)).thenReturn(Collections.singletonList(mockTsd));

        TeacherProfileResponse response = teacherService.getProfile();

        assertNotNull(response);
        assertEquals("DY Patil University", response.getSchoolName());
        assertEquals("6th - A", response.getAssignedStandard());
        assertEquals("DY Patil University", response.getIdentity().getSchoolName());
        assertEquals("6th - A", response.getIdentity().getStandard());
    }
}
