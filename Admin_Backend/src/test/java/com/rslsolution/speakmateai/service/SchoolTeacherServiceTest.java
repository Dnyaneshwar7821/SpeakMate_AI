package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

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

import com.rslsolution.speakmateai.dto.request.SchoolTeacherRequest;
import com.rslsolution.speakmateai.dto.request.StandardDivisionPair;
import com.rslsolution.speakmateai.exception.DuplicateAssignmentException;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.StandardDivision;
import com.rslsolution.speakmateai.entity.Teacher;
import com.rslsolution.speakmateai.entity.TeacherStandardDivision;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ClassRoomRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import com.rslsolution.speakmateai.repository.TeacherRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.SchoolTeacherServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SchoolTeacherServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private SchoolRepository schoolRepository;
    @Mock private SettingsRepository settingsRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private ClassRoomRepository classRoomRepository;
    @Mock private SchoolStandardRepository schoolStandardRepository;
    @Mock private StandardDivisionRepository standardDivisionRepository;
    @Mock private TeacherStandardDivisionRepository teacherStandardDivisionRepository;

    @InjectMocks
    private SchoolTeacherServiceImpl schoolTeacherService;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.getName()).thenReturn("admin@school.com");
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void testCreateTeacher_Success() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));
        when(userRepository.existsByEmail("teacher@school.com")).thenReturn(false);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacher@school.com")
            .password("password")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("5").division("A").build()
            ))
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(10L);
        mockSaved.setRole(Role.TEACHER);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);

        SchoolStandard ss = SchoolStandard.builder().id(1L).standard("5").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "5")).thenReturn(Optional.of(ss));
        StandardDivision sd = StandardDivision.builder().id(1L).division("A").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(1L, "A")).thenReturn(Optional.of(sd));
        
        when(teacherStandardDivisionRepository.findByTeacherId(10L)).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            schoolTeacherService.createTeacher(request);
        });
    }

    @Test
    void testCreateTeacher_InvalidStandard_ThrowsException() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacher@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("Invalid").division("A").build()
            ))
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(10L);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "Invalid")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            schoolTeacherService.createTeacher(request);
        });
    }

    @Test
    void testCreateTeacher_LegacyPayload_FallbackWorks() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));
        when(userRepository.existsByEmail("teacher@school.com")).thenReturn(false);

        // Legacy request with standard and division, but NO standardDivisions array
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacher@school.com")
            .password("password")
            .standard("5")
            .division("B")
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(10L);
        mockSaved.setRole(Role.TEACHER);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);

        SchoolStandard ss = SchoolStandard.builder().id(1L).standard("5").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "5")).thenReturn(Optional.of(ss));
        StandardDivision sd = StandardDivision.builder().id(1L).division("B").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(1L, "B")).thenReturn(Optional.of(sd));
        
        when(teacherStandardDivisionRepository.findByTeacherId(10L)).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            schoolTeacherService.createTeacher(request);
        });
        
        // Ensure that the fallback successfully triggers repository queries for "5" and "B"
        verify(schoolStandardRepository).findBySchoolIdAndStandard(1L, "5");
        verify(standardDivisionRepository).findBySchoolStandardIdAndDivision(1L, "B");
    }

    @Test
    void testUpdateTeacher_MultiStandard_ClassRoomIsolation() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        Teacher existingTeacher = new Teacher();
        existingTeacher.setId(10L);
        existingTeacher.setRole(Role.TEACHER);
        existingTeacher.setSchoolId(1L);
        
        when(teacherRepository.findById(10L)).thenReturn(Optional.of(existingTeacher));
        when(teacherRepository.save(any(Teacher.class))).thenReturn(existingTeacher);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacher@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("5").division("A").build(),
                StandardDivisionPair.builder().standard("6").division("C").build()
            ))
            .build();

        SchoolStandard ss5 = SchoolStandard.builder().id(1L).standard("5").build();
        SchoolStandard ss6 = SchoolStandard.builder().id(2L).standard("6").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "5")).thenReturn(Optional.of(ss5));
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "6")).thenReturn(Optional.of(ss6));
        
        StandardDivision sd5 = StandardDivision.builder().id(1L).division("A").build();
        StandardDivision sd6 = StandardDivision.builder().id(2L).division("C").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(1L, "A")).thenReturn(Optional.of(sd5));
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(2L, "C")).thenReturn(Optional.of(sd6));

        assertDoesNotThrow(() -> {
            schoolTeacherService.updateTeacher(10L, request);
        });

        // Verify ClassRoom synchronization strictly uses findByTeacherId to prevent stealing
        verify(classRoomRepository, atLeastOnce()).findByTeacherId(10L);
    }

    @Test
    void testUpdateTeacher_SameStandardMultipleDivisions() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        Teacher existingTeacher = new Teacher();
        existingTeacher.setId(10L);
        existingTeacher.setRole(Role.TEACHER);
        existingTeacher.setSchoolId(1L);
        
        when(teacherRepository.findById(10L)).thenReturn(Optional.of(existingTeacher));
        when(teacherRepository.save(any(Teacher.class))).thenReturn(existingTeacher);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacher@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("5").division("A").build(),
                StandardDivisionPair.builder().standard("5").division("B").build()
            ))
            .build();

        SchoolStandard ss5 = SchoolStandard.builder().id(1L).standard("5").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "5")).thenReturn(Optional.of(ss5));
        
        StandardDivision sd5A = StandardDivision.builder().id(1L).division("A").build();
        StandardDivision sd5B = StandardDivision.builder().id(2L).division("B").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(1L, "A")).thenReturn(Optional.of(sd5A));
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(1L, "B")).thenReturn(Optional.of(sd5B));

        // Mock that the teacher currently has no classrooms
        when(classRoomRepository.findByTeacherId(10L)).thenReturn(new java.util.ArrayList<>());

        assertDoesNotThrow(() -> {
            schoolTeacherService.updateTeacher(10L, request);
        });

        // It should save 2 distinct ClassRooms
        verify(classRoomRepository, times(2)).save(any(com.rslsolution.speakmateai.entity.ClassRoom.class));
    }

    @Test
    void testUpdateTeacher_LegacyClassRoomUpgrade() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        Teacher existingTeacher = new Teacher();
        existingTeacher.setId(10L);
        existingTeacher.setRole(Role.TEACHER);
        existingTeacher.setSchoolId(1L);
        
        when(teacherRepository.findById(10L)).thenReturn(Optional.of(existingTeacher));
        when(teacherRepository.save(any(Teacher.class))).thenReturn(existingTeacher);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacher@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("5").division("A").build()
            ))
            .build();

        SchoolStandard ss5 = SchoolStandard.builder().id(1L).standard("5").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "5")).thenReturn(Optional.of(ss5));
        StandardDivision sd5A = StandardDivision.builder().id(1L).division("A").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(1L, "A")).thenReturn(Optional.of(sd5A));

        // Mock that the teacher currently has a legacy classroom with NULL division
        com.rslsolution.speakmateai.entity.ClassRoom legacyRoom = com.rslsolution.speakmateai.entity.ClassRoom.builder()
            .grade("5")
            .division(null) // legacy
            .build();
            
        when(classRoomRepository.findByTeacherId(10L)).thenReturn(new java.util.ArrayList<>(Arrays.asList(legacyRoom)));

        assertDoesNotThrow(() -> {
            schoolTeacherService.updateTeacher(10L, request);
        });

        // Should upgrade the legacy classroom
        assertEquals("A", legacyRoom.getDivision());
        
        // It should save the upgraded ClassRoom, no new ClassRoom created
        verify(classRoomRepository, times(1)).save(any(com.rslsolution.speakmateai.entity.ClassRoom.class));
    }

    // =========================================================================
    // PHASE 1 VALIDATION TESTS (Tests A - F)
    // =========================================================================

    @Test
    void testA_CreateDuplicate_ThrowsConflict() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));
        when(userRepository.existsByEmail("teacherB@school.com")).thenReturn(false);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacherB@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("8th").division("A").build()
            ))
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(20L);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);

        SchoolStandard ss8 = SchoolStandard.builder().id(8L).standard("8th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "8th")).thenReturn(Optional.of(ss8));
        StandardDivision sd8A = StandardDivision.builder().id(81L).division("A").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(8L, "A")).thenReturn(Optional.of(sd8A));

        // Existing assignment for 8th-A belongs to Teacher-A
        User teacherA = User.builder().id(10L).firstName("Suresh").lastName("Patil").email("suresh@school.com").build();
        TeacherStandardDivision existingTsd = TeacherStandardDivision.builder()
            .id(1L)
            .teacher(teacherA)
            .standardDivision(sd8A)
            .build();
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionId(81L)).thenReturn(Optional.of(existingTsd));

        DuplicateAssignmentException ex = assertThrows(DuplicateAssignmentException.class, () -> {
            schoolTeacherService.createTeacher(request);
        });

        assertTrue(ex.getMessage().contains("Standard 8th - Division A is already assigned to Suresh Patil"));
        verify(classRoomRepository, never()).save(any());
    }

    @Test
    void testB_DifferentDivision_Success() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));
        when(userRepository.existsByEmail("teacherB@school.com")).thenReturn(false);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacherB@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("8th").division("B").build()
            ))
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(20L);
        mockSaved.setRole(Role.TEACHER);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);

        SchoolStandard ss8 = SchoolStandard.builder().id(8L).standard("8th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "8th")).thenReturn(Optional.of(ss8));
        StandardDivision sd8B = StandardDivision.builder().id(82L).division("B").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(8L, "B")).thenReturn(Optional.of(sd8B));

        // 8th-B has NO existing assignment
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionId(82L)).thenReturn(Optional.empty());
        when(teacherStandardDivisionRepository.findByTeacherId(20L)).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            schoolTeacherService.createTeacher(request);
        });
    }

    @Test
    void testC_DifferentSchool_Success() {
        // Super Admin creating teacher in School Y (schoolId = 2)
        User superAdmin = User.builder().email("admin@school.com").role(Role.SUPER_ADMIN).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(superAdmin));
        when(userRepository.existsByEmail("teacherY@school.com")).thenReturn(false);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacherY@school.com")
            .schoolId(2L) // School Y
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("8th").division("A").build()
            ))
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(30L);
        mockSaved.setRole(Role.TEACHER);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);

        // School Y has standard 8th (id = 28) and division A (id = 281)
        SchoolStandard ssSchoolY = SchoolStandard.builder().id(28L).school(com.rslsolution.speakmateai.entity.School.builder().id(2L).build()).standard("8th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(2L, "8th")).thenReturn(Optional.of(ssSchoolY));
        StandardDivision sdSchoolY = StandardDivision.builder().id(281L).schoolStandard(ssSchoolY).division("A").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(28L, "A")).thenReturn(Optional.of(sdSchoolY));

        // StandardDivision 281 in School Y is completely unassigned
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionId(281L)).thenReturn(Optional.empty());
        when(teacherStandardDivisionRepository.findByTeacherId(30L)).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            schoolTeacherService.createTeacher(request);
        });
    }

    @Test
    void testD_EditSameTeacher_Success() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        Teacher existingTeacher = new Teacher();
        existingTeacher.setId(10L); // Teacher-A
        existingTeacher.setRole(Role.TEACHER);
        existingTeacher.setSchoolId(1L);

        when(teacherRepository.findById(10L)).thenReturn(Optional.of(existingTeacher));
        when(teacherRepository.save(any(Teacher.class))).thenReturn(existingTeacher);

        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacherA@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("8th").division("A").build(),
                StandardDivisionPair.builder().standard("9th").division("B").build()
            ))
            .build();

        SchoolStandard ss8 = SchoolStandard.builder().id(8L).standard("8th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "8th")).thenReturn(Optional.of(ss8));
        StandardDivision sd8A = StandardDivision.builder().id(81L).division("A").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(8L, "A")).thenReturn(Optional.of(sd8A));

        SchoolStandard ss9 = SchoolStandard.builder().id(9L).standard("9th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "9th")).thenReturn(Optional.of(ss9));
        StandardDivision sd9B = StandardDivision.builder().id(92L).division("B").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(9L, "B")).thenReturn(Optional.of(sd9B));

        // For Teacher-A (10L), findFirstByStandardDivisionIdAndTeacherIdNot excludes 10L, returning empty!
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionIdAndTeacherIdNot(81L, 10L)).thenReturn(Optional.empty());
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionIdAndTeacherIdNot(92L, 10L)).thenReturn(Optional.empty());
        when(classRoomRepository.findByTeacherId(10L)).thenReturn(Collections.emptyList());

        assertDoesNotThrow(() -> {
            schoolTeacherService.updateTeacher(10L, request);
        });
    }

    @Test
    void testE_EditAndAddConflictingAssignment_ThrowsConflict() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));

        Teacher existingTeacherA = new Teacher();
        existingTeacherA.setId(10L); // Teacher-A
        existingTeacherA.setRole(Role.TEACHER);
        existingTeacherA.setSchoolId(1L);

        when(teacherRepository.findById(10L)).thenReturn(Optional.of(existingTeacherA));

        // Teacher-A attempts to add 8th-C, which is assigned to Teacher-B (id = 20)
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacherA@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("8th").division("C").build()
            ))
            .build();

        SchoolStandard ss8 = SchoolStandard.builder().id(8L).standard("8th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "8th")).thenReturn(Optional.of(ss8));
        StandardDivision sd8C = StandardDivision.builder().id(83L).division("C").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(8L, "C")).thenReturn(Optional.of(sd8C));

        User teacherB = User.builder().id(20L).firstName("Anita").lastName("Deshmukh").build();
        TeacherStandardDivision existingTsd = TeacherStandardDivision.builder()
            .id(2L)
            .teacher(teacherB)
            .standardDivision(sd8C)
            .build();
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionIdAndTeacherIdNot(83L, 10L)).thenReturn(Optional.of(existingTsd));

        DuplicateAssignmentException ex = assertThrows(DuplicateAssignmentException.class, () -> {
            schoolTeacherService.updateTeacher(10L, request);
        });

        assertTrue(ex.getMessage().contains("Standard 8th - Division C is already assigned to Anita Deshmukh"));
        verify(teacherStandardDivisionRepository, never()).deleteByTeacherId(10L);
    }

    @Test
    void testF_MultipleAssignmentsWithConflict_RejectsEntirely() {
        User admin = User.builder().email("admin@school.com").role(Role.SCHOOL_ADMIN).schoolId(1L).build();
        when(userRepository.findByEmail("admin@school.com")).thenReturn(Optional.of(admin));
        when(userRepository.existsByEmail("teacherNew@school.com")).thenReturn(false);

        // Attempt 8th-A (occupied) and 8th-B (free)
        SchoolTeacherRequest request = SchoolTeacherRequest.builder()
            .email("teacherNew@school.com")
            .standardDivisions(Arrays.asList(
                StandardDivisionPair.builder().standard("8th").division("A").build(),
                StandardDivisionPair.builder().standard("8th").division("B").build()
            ))
            .build();

        Teacher mockSaved = new Teacher();
        mockSaved.setId(40L);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(mockSaved);

        SchoolStandard ss8 = SchoolStandard.builder().id(8L).standard("8th").build();
        when(schoolStandardRepository.findBySchoolIdAndStandard(1L, "8th")).thenReturn(Optional.of(ss8));
        StandardDivision sd8A = StandardDivision.builder().id(81L).division("A").build();
        StandardDivision sd8B = StandardDivision.builder().id(82L).division("B").build();
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(8L, "A")).thenReturn(Optional.of(sd8A));
        when(standardDivisionRepository.findBySchoolStandardIdAndDivision(8L, "B")).thenReturn(Optional.of(sd8B));

        User teacherA = User.builder().id(10L).firstName("Teacher-A").build();
        TeacherStandardDivision tsdA = TeacherStandardDivision.builder().teacher(teacherA).standardDivision(sd8A).build();
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionId(81L)).thenReturn(Optional.of(tsdA));
        when(teacherStandardDivisionRepository.findFirstByStandardDivisionId(82L)).thenReturn(Optional.empty());

        assertThrows(DuplicateAssignmentException.class, () -> {
            schoolTeacherService.createTeacher(request);
        });

        // Verify that assignments are NOT persisted
        verify(teacherStandardDivisionRepository, never()).save(any());
    }
}
