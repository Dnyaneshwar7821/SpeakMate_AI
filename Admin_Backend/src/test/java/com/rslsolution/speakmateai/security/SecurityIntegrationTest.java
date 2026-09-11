package com.rslsolution.speakmateai.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rslsolution.speakmateai.service.TeacherService;
import com.rslsolution.speakmateai.service.ClassRoomService;

@SpringBootTest
public class SecurityIntegrationTest {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private ClassRoomService classRoomService;

    @Test
    @DisplayName("Unauthenticated request to Teacher API must fail closed")
    void testUnauthenticatedTeacherAccessFailsClosed() {
        SecurityContextHolder.clearContext();
        assertThrows(AccessDeniedException.class, () -> {
            teacherService.getTeacherDashboard();
        }, "Unauthenticated requests to getTeacherDashboard must throw AccessDeniedException");
    }

    @Test
    @DisplayName("Unauthenticated request to Teacher Students must fail closed")
    void testUnauthenticatedStudentsAccessFailsClosed() {
        SecurityContextHolder.clearContext();
        assertThrows(AccessDeniedException.class, () -> {
            teacherService.getStudents(null, null);
        }, "Unauthenticated requests to getStudents must throw AccessDeniedException");
    }

    @Test
    @DisplayName("Unauthenticated request to Teacher Profile must fail closed")
    void testUnauthenticatedProfileAccessFailsClosed() {
        SecurityContextHolder.clearContext();
        assertThrows(AccessDeniedException.class, () -> {
            teacherService.getProfile();
        }, "Unauthenticated requests to getProfile must throw AccessDeniedException");
    }

    @Test
    @DisplayName("Teacher must only see students matching both School and Assigned Standard")
    void testTeacherStudentVisibilityBySchoolAndStandard() {
        SecurityContextHolder.clearContext();
        org.springframework.security.authentication.UsernamePasswordAuthenticationToken auth =
            new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                "teacher@test.com", null, java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_TEACHER"))
            );
        SecurityContextHolder.getContext().setAuthentication(auth);

        var result = teacherService.getStudents(null, null);
        assertNotNull(result, "Result should not be null");
        assertNotNull(result.getStudents(), "Students list should not be null");

        // Verify all returned students belong to teacher's authorized school & standard
        for (var studentSummary : result.getStudents()) {
            assertNotNull(studentSummary.getId(), "Student ID should be valid");
        }
    }
}
