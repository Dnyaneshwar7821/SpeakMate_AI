package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.StudentRequest;
import com.rslsolution.speakmateai.dto.response.StudentResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.AdminRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.email.EmailTemplateService;
import com.rslsolution.speakmateai.service.impl.StudentServiceImpl;
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
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StudentEmailDispatchTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AdminRepository adminRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private EmailTemplateService emailTemplateService;

    @Mock
    private SchoolRepository schoolRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(studentService, "emailService", emailService);
        ReflectionTestUtils.setField(studentService, "emailTemplateService", emailTemplateService);
        ReflectionTestUtils.setField(studentService, "schoolRepository", schoolRepository);

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("schooladmin@school.com");
        SecurityContext sec = mock(SecurityContext.class);
        when(sec.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sec);

        User schoolAdmin = new User();
        schoolAdmin.setId(10L);
        schoolAdmin.setEmail("schooladmin@school.com");
        schoolAdmin.setRole(Role.SCHOOL_ADMIN);
        schoolAdmin.setSchoolId(101L);

        when(userRepository.findByEmail("schooladmin@school.com")).thenReturn(Optional.of(schoolAdmin));
    }

    @Test
    void testCreateStudent_DispatchesCredentialEmailAndReturnsEmailSentTrue() {
        StudentRequest request = StudentRequest.builder()
                .firstName("Aarav")
                .lastName("Sharma")
                .email("aarav.sharma@example.com")
                .password("TempPass123!")
                .standard("10")
                .division("A")
                .rollNumber("RN-101")
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");

        School school = new School();
        school.setId(101L);
        school.setName("Greenwood International");
        school.setSchoolCode("GWI-01");
        when(schoolRepository.findById(101L)).thenReturn(Optional.of(school));

        when(emailTemplateService.buildStudentWelcomeEmailHtml(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn("<html>Welcome Aarav</html>");
        when(emailTemplateService.buildStudentWelcomeEmailText(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn("Welcome Aarav");

        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            s.setId(500L);
            s.setStatus(Status.ACTIVE);
            return s;
        });

        StudentResponse response = studentService.createStudent(request);

        assertNotNull(response);
        assertEquals(500L, response.getId());
        assertEquals("aarav.sharma@example.com", response.getEmail());
        assertTrue(response.getEmailSent(), "Expected emailSent to be true after successful dispatch");

        verify(emailService, times(1)).sendHtmlEmail(
                eq("aarav.sharma@example.com"),
                contains("Credentials"),
                contains("<html>Welcome Aarav</html>"),
                contains("Welcome Aarav")
        );
    }

    @Test
    void testCreateStudent_EmailFailureDoesNotBreakStudentCreation() {
        StudentRequest request = StudentRequest.builder()
                .firstName("Rohan")
                .lastName("Verma")
                .email("rohan.verma@example.com")
                .password("TempPass456!")
                .build();

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");

        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> {
            Student s = invocation.getArgument(0);
            s.setId(501L);
            s.setStatus(Status.ACTIVE);
            return s;
        });

        doThrow(new RuntimeException("Brevo API network timeout"))
                .when(emailService).sendHtmlEmail(any(), any(), any(), any());

        StudentResponse response = studentService.createStudent(request);

        assertNotNull(response);
        assertEquals(501L, response.getId());
        assertFalse(response.getEmailSent(), "Expected emailSent to be false when email dispatch fails");
    }
}
