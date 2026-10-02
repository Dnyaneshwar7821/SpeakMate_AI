package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.StudentRequest;
import com.rslsolution.speakmateai.entity.Notification;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.NotificationType;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.NotificationRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.NotificationServiceImpl;
import com.rslsolution.speakmateai.service.impl.StudentServiceImpl;

@ExtendWith(MockitoExtension.class)
class SchoolAdminNotificationSystemTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private NotificationServiceImpl notificationService;
    private StudentServiceImpl studentService;

    private User schoolAdmin;
    private Student sampleStudent;
    private final Long schoolId = 101L;

    @BeforeEach
    void setUp() {
        notificationService = spy(new NotificationServiceImpl(notificationRepository, userRepository, adminRepository));

        studentService = new StudentServiceImpl(
                userRepository,
                studentRepository,
                adminRepository,
                passwordEncoder,
                notificationService
        );

        schoolAdmin = new User();
        schoolAdmin.setId(1L);
        schoolAdmin.setEmail("admin@school.com");
        schoolAdmin.setRole(Role.SCHOOL_ADMIN);
        schoolAdmin.setSchoolId(schoolId);

        sampleStudent = new Student();
        sampleStudent.setId(50L);
        sampleStudent.setFirstName("John");
        sampleStudent.setLastName("Doe");
        sampleStudent.setEmail("john.doe@student.com");
        sampleStudent.setSchoolId(schoolId);
        sampleStudent.setActive(true);
        sampleStudent.setStatus(Status.ACTIVE);

        lenient().when(userRepository.findBySchoolIdAndRole(schoolId, Role.SCHOOL_ADMIN))
                .thenReturn(List.of(schoolAdmin));

        lenient().when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> {
                    Notification n = invocation.getArgument(0);
                    n.setId(999L);
                    return n;
                });
    }

    @Test
    @DisplayName("1. Student Deleted Notification")
    void testStudentDeletedNotification() {
        when(studentRepository.findByIdAndSchoolId(eq(50L), eq(schoolId)))
                .thenReturn(Optional.of(sampleStudent));

        setMockSecurityContext("admin@school.com", Role.SCHOOL_ADMIN, schoolId);

        studentService.deleteStudent(50L);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, atLeastOnce()).save(captor.capture());

        Notification deletedNotif = captor.getAllValues().stream()
                .filter(n -> n.getNotificationType() == NotificationType.STUDENT_DELETED)
                .findFirst()
                .orElse(null);

        assertNotNull(deletedNotif, "Notification for deleted student should be saved.");
        assertEquals("Student Deleted", deletedNotif.getTitle());
        assertEquals("Student John Doe was deleted.", deletedNotif.getMessage());
        assertEquals("admin@school.com", deletedNotif.getRecipientEmail());
    }

    @Test
    @DisplayName("2. Student Information Updated Notification")
    void testStudentUpdatedNotification() {
        when(studentRepository.findByIdAndSchoolId(eq(50L), eq(schoolId)))
                .thenReturn(Optional.of(sampleStudent));
        when(studentRepository.save(any(Student.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        setMockSecurityContext("admin@school.com", Role.SCHOOL_ADMIN, schoolId);

        StudentRequest request = StudentRequest.builder()
                .firstName("John")
                .lastName("Smith")
                .build();

        studentService.updateStudent(50L, request);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, atLeastOnce()).save(captor.capture());

        Notification notif = captor.getAllValues().stream()
                .filter(n -> "Student Updated".equals(n.getTitle()))
                .findFirst()
                .orElse(null);

        assertNotNull(notif, "Notification for student update should be generated.");
        assertEquals("Student John Smith's information was updated.", notif.getMessage());
    }

    @Test
    @DisplayName("3. Student Retry / Reset Password Action Notification")
    void testStudentResetNotification() {
        when(studentRepository.findByIdAndSchoolId(eq(50L), eq(schoolId)))
                .thenReturn(Optional.of(sampleStudent));
        when(studentRepository.save(any(Student.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        setMockSecurityContext("admin@school.com", Role.SCHOOL_ADMIN, schoolId);

        studentService.resetPassword(50L, "NewSecurePassword123!");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, atLeastOnce()).save(captor.capture());

        Notification notif = captor.getAllValues().stream()
                .filter(n -> "Student Account Reset".equals(n.getTitle()))
                .findFirst()
                .orElse(null);

        assertNotNull(notif, "Notification for student reset should be generated.");
        assertEquals("Student John Doe's account was reset/retried.", notif.getMessage());
    }

    @Test
    @DisplayName("4. Student Active -> Inactive Notification")
    void testStudentActiveToInactiveNotification() {
        sampleStudent.setActive(true);
        sampleStudent.setStatus(Status.ACTIVE);

        when(studentRepository.findByIdAndSchoolId(eq(50L), eq(schoolId)))
                .thenReturn(Optional.of(sampleStudent));
        when(studentRepository.save(any(Student.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        setMockSecurityContext("admin@school.com", Role.SCHOOL_ADMIN, schoolId);

        StudentRequest request = StudentRequest.builder()
                .active(false)
                .build();

        studentService.updateStudent(50L, request);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, atLeastOnce()).save(captor.capture());

        Notification notif = captor.getAllValues().stream()
                .filter(n -> "Student John Doe was marked as inactive.".equals(n.getMessage()))
                .findFirst()
                .orElse(null);

        assertNotNull(notif, "Notification for active->inactive transition should be generated.");
        assertEquals("Student Status Updated", notif.getTitle());
    }

    @Test
    @DisplayName("5. Student Inactive -> Active Notification")
    void testStudentInactiveToActiveNotification() {
        sampleStudent.setActive(false);
        sampleStudent.setStatus(Status.INACTIVE);

        when(studentRepository.findByIdAndSchoolId(eq(50L), eq(schoolId)))
                .thenReturn(Optional.of(sampleStudent));
        when(studentRepository.save(any(Student.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        setMockSecurityContext("admin@school.com", Role.SCHOOL_ADMIN, schoolId);

        StudentRequest request = StudentRequest.builder()
                .active(true)
                .build();

        studentService.updateStudent(50L, request);

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository, atLeastOnce()).save(captor.capture());

        Notification notif = captor.getAllValues().stream()
                .filter(n -> "Student John Doe was marked as active.".equals(n.getMessage()))
                .findFirst()
                .orElse(null);

        assertNotNull(notif, "Notification for inactive->active transition should be generated.");
        assertEquals("Student Status Updated", notif.getTitle());
    }

    private void setMockSecurityContext(String email, Role role, Long schoolId) {
        User user = new User();
        user.setEmail(email);
        user.setRole(role);
        user.setSchoolId(schoolId);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        org.springframework.security.core.Authentication auth = mock(org.springframework.security.core.Authentication.class);
        when(auth.getName()).thenReturn(email);
        org.springframework.security.core.context.SecurityContext secCtx = mock(org.springframework.security.core.context.SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        org.springframework.security.core.context.SecurityContextHolder.setContext(secCtx);
    }
}
