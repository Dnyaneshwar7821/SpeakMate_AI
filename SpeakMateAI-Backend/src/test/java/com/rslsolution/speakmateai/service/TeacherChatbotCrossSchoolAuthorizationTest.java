package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import com.rslsolution.speakmateai.assistant.provider.SchoolRosterDataProvider;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.TeacherRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;

/**
 * Regression tests for the cross-school authorization bug in the Teacher
 * Chatbot (SchoolRosterDataProvider).
 *
 * <p>Confirmed root cause: the TEACHER early-return path (resolving assigned
 * students) ran BEFORE the school-name cross-school access guard. A DY Patil
 * teacher asking "students of PCMC school" received DY Patil students, which
 * the LLM then labelled as PCMC students.
 *
 * <p>Fix: the cross-school access guard now runs as the very first block in
 * {@code SchoolRosterDataProvider.provide()}, before any data retrieval.
 */
@DisplayName("Teacher Chatbot Cross-School Authorization Regression Tests")
class TeacherChatbotCrossSchoolAuthorizationTest {

    @Mock private SchoolRepository schoolRepository;
    @Mock private UserRepository userRepository;
    @Mock private StudentRepository studentRepository;
    @Mock private TeacherRepository teacherRepository;
    @Mock private TeacherStandardDivisionRepository teacherStandardDivisionRepository;
    @Mock private TeacherAssignmentResolver teacherAssignmentResolver;
    @Mock private ProgressRepository progressRepository;

    private ObjectMapper objectMapper;
    private SchoolRosterDataProvider provider;

    private School dyPatilSchool;
    private School pcmcSchool;
    private Student dyPatilStudent;
    private ActorContext dyPatilTeacherActor;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();

        provider = new SchoolRosterDataProvider(
                schoolRepository, userRepository, studentRepository,
                teacherRepository, teacherStandardDivisionRepository,
                teacherAssignmentResolver, progressRepository, objectMapper);

        dyPatilSchool = new School();
        dyPatilSchool.setId(202L);
        dyPatilSchool.setName("DY Patil University");

        pcmcSchool = new School();
        pcmcSchool.setId(101L);
        pcmcSchool.setName("PCMC School");

        dyPatilStudent = new Student();
        dyPatilStudent.setId(99L);
        dyPatilStudent.setFirstName("Onkar");
        dyPatilStudent.setLastName("Awate");
        dyPatilStudent.setSchoolId(202L);
        dyPatilStudent.setRole(Role.STUDENT);

        // Authenticated DY Patil teacher
        dyPatilTeacherActor = ActorContext.builder()
                .userId(500L).role(Role.TEACHER)
                .teacherId(500L).schoolId(202L).build();
    }

    // ── Test 1: Same school — teacher gets own students ─────────────────────

    @Test
    @DisplayName("Test 1 — Same school: DY Patil teacher gets only their assigned students")
    void test1_sameSchool_teacherGetsOwnStudents() {
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "DY Patil University");
        params.put("entityType", "students");

        when(schoolRepository.findByName("DY Patil University")).thenReturn(Optional.of(dyPatilSchool));
        when(teacherAssignmentResolver.resolveAssignedStudents(500L, 202L))
                .thenReturn(List.of(dyPatilStudent));

        String result = provider.provide(dyPatilTeacherActor, params);

        assertFalse(result.contains("ACCESS DENIED"),
                "Should NOT deny access when teacher requests their own school");
        assertTrue(result.contains("Onkar"),
                "Should return DY Patil student when teacher requests their own school");
        verify(teacherAssignmentResolver).resolveAssignedStudents(500L, 202L);
    }

    // ── Test 2: CORE BUG REGRESSION — different school → ACCESS DENIED ───────

    @Test
    @DisplayName("Test 2 (CORE REGRESSION) — DY Patil teacher asking PCMC students gets ACCESS DENIED, no DY Patil data leaked")
    void test2_differentSchool_teacherDeniedForOtherSchool() {
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "PCMC School");
        params.put("entityType", "students");

        // resolveSchoolByName resolves PCMC School → id=101, different from teacher's 202
        when(schoolRepository.findByName("PCMC School")).thenReturn(Optional.of(pcmcSchool));

        String result = provider.provide(dyPatilTeacherActor, params);

        // MUST be ACCESS DENIED
        assertTrue(result.contains("ACCESS DENIED"),
                "Must return ACCESS DENIED when DY Patil teacher asks for PCMC students");
        // MUST NOT contain any student name from either school
        assertFalse(result.contains("Onkar"),
                "Must NOT leak DY Patil student records when access is denied");
        assertFalse(result.contains("Yash"),
                "Must NOT return any student record when access is denied");

        // TeacherAssignmentResolver must NEVER be called — data retrieval must stop
        verify(teacherAssignmentResolver, never()).resolveAssignedStudents(any(), any());
        // Student repository must NEVER be queried
        verify(studentRepository, never()).findBySchoolId(any());
        verify(studentRepository, never()).findAll();
    }

    // ── Test 3: Non-existent school — no fallback to teacher's students ───────

    @Test
    @DisplayName("Test 3 — Non-existent school: safe NO DATA, must NOT fall back to DY Patil students")
    void test3_nonExistentSchool_noFallback() {
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "XYZ School");

        // All lookups for "XYZ School" return empty
        when(schoolRepository.findByName("XYZ School")).thenReturn(Optional.empty());
        when(schoolRepository.findByNameIgnoreCase("XYZ School")).thenReturn(Optional.empty());
        when(schoolRepository.findAll()).thenReturn(List.of(dyPatilSchool, pcmcSchool));

        String result = provider.provide(dyPatilTeacherActor, params);

        // Must NOT fall back to teacher's own students
        assertFalse(result.contains("Onkar"),
                "Must NOT fall back to DY Patil students when XYZ school doesn't exist");
        assertFalse(result.contains("Yash"),
                "Must NOT return any student from any school");

        verify(teacherAssignmentResolver, never()).resolveAssignedStudents(any(), any());
    }

    // ── Test 4: No school specified — teacher gets own assigned students ──────

    @Test
    @DisplayName("Test 4 — No school specified: teacher gets only their own assigned students")
    void test4_noSchoolSpecified_teacherGetsOwnStudents() {
        Map<String, Object> params = new HashMap<>();
        params.put("entityType", "students");
        // No schoolName / school param

        when(teacherAssignmentResolver.resolveAssignedStudents(500L, 202L))
                .thenReturn(List.of(dyPatilStudent));

        String result = provider.provide(dyPatilTeacherActor, params);

        assertFalse(result.contains("ACCESS DENIED"),
                "Should NOT deny when no school is specified");
        assertTrue(result.contains("Onkar"),
                "Should return teacher's own assigned students when no school specified");
        verify(teacherAssignmentResolver).resolveAssignedStudents(500L, 202L);
    }

    // ── Test 5: Prompt manipulation — schoolName=PCMC still denied ───────────

    @Test
    @DisplayName("Test 5 — Prompt manipulation: schoolName=PCMC in params still triggers ACCESS DENIED")
    void test5_promptManipulation_stillDenied() {
        // Adversarial params — schoolName is PCMC regardless of how it got there
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "PCMC School");

        when(schoolRepository.findByName("PCMC School")).thenReturn(Optional.of(pcmcSchool));

        String result = provider.provide(dyPatilTeacherActor, params);

        // Backend authorization is authoritative — still ACCESS DENIED
        assertTrue(result.contains("ACCESS DENIED"),
                "Backend must deny regardless of how the school name arrived in params");
        assertFalse(result.contains("Onkar"),
                "No student data must leak even under prompt manipulation");
        verify(teacherAssignmentResolver, never()).resolveAssignedStudents(any(), any());
        verify(studentRepository, never()).findBySchoolId(any());
    }

    // ── Test 6: Empty authorized school — no substitution ────────────────────

    @Test
    @DisplayName("Test 6 — Empty authorized school: zero students returned, no substitution from other schools")
    void test6_emptyAuthorizedSchool_noSubstitution() {
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "DY Patil University");

        when(schoolRepository.findByName("DY Patil University")).thenReturn(Optional.of(dyPatilSchool));
        // Teacher has zero assigned students in their own school
        when(teacherAssignmentResolver.resolveAssignedStudents(500L, 202L))
                .thenReturn(List.of());

        String result = provider.provide(dyPatilTeacherActor, params);

        assertFalse(result.contains("ACCESS DENIED"),
                "Should NOT deny when teacher requests their own school");
        assertFalse(result.contains("Onkar"),
                "Must return empty — not substitute another school's students");
        assertFalse(result.contains("Yash"),
                "Must NOT return PCMC students as a fallback");
        verify(teacherAssignmentResolver).resolveAssignedStudents(500L, 202L);
        // Student repository must NOT be called for a broader fallback fetch
        verify(studentRepository, never()).findAll();
    }

    // ── Scenario 5: PCMC exists but has zero students — still ACCESS DENIED ──

    @Test
    @DisplayName("Scenario 5 — PCMC has zero students: DY Patil teacher still gets ACCESS DENIED, not DY Patil fallback")
    void scenario5_pcmcExistsButEmpty_stillAccessDenied() {
        // The exact original bug scenario: PCMC Public School exists in DB but has 0 students.
        // The teacher belongs to DY Patil (schoolId=202).
        // Expected: ACCESS DENIED, no DY Patil students returned.
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "PCMC School");

        // PCMC School resolves correctly — different from teacher's DY Patil (202)
        when(schoolRepository.findByName("PCMC School")).thenReturn(Optional.of(pcmcSchool));

        String result = provider.provide(dyPatilTeacherActor, params);

        // Must be ACCESS DENIED — the fact PCMC has zero students is irrelevant
        assertTrue(result.contains("ACCESS DENIED"),
                "PCMC exists but teacher is DY Patil — must be ACCESS DENIED");
        assertFalse(result.contains("Onkar"),
                "Must NOT return DY Patil students as fallback when PCMC has zero students");
        // resolveAssignedStudents must NOT be called — authorization stops before retrieval
        verify(teacherAssignmentResolver, never()).resolveAssignedStudents(any(), any());
        verify(studentRepository, never()).findBySchoolId(any());
    }

    // ── Scenario 7: Ambiguous/partial school name — must NOT silently resolve ──

    @Test
    @DisplayName("Scenario 7 — Ambiguous name 'PCMC' (partial): fuzzy match resolves to PCMC School, triggers ACCESS DENIED")
    void scenario7_ambiguousPartialName_pcmcFuzzyMatch_accessDenied() {
        // Real-world scenario: user types "PCMC" or "PCMC school" — the fuzzy
        // matcher resolves it to PCMC School (id=101). Teacher is DY Patil (id=202).
        // schoolRepository.findByName("PCMC") returns empty,
        // schoolRepository.findByNameIgnoreCase("PCMC") returns empty,
        // schoolRepository.findAll() returns [dyPatilSchool, pcmcSchool] and
        // schoolKey("PCMC") = "pcmc", schoolKey("PCMC School") = "pcmcschool"
        // → "pcmcschool".contains("pcmc") = TRUE → resolves to pcmcSchool
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "PCMC");  // partial name as LLM might extract it

        // Exact lookups miss
        when(schoolRepository.findByName("PCMC")).thenReturn(Optional.empty());
        when(schoolRepository.findByNameIgnoreCase("PCMC")).thenReturn(Optional.empty());
        // Fuzzy: findAll returns both schools — PCMC School will match "pcmc"
        when(schoolRepository.findAll()).thenReturn(List.of(pcmcSchool, dyPatilSchool));

        String result = provider.provide(dyPatilTeacherActor, params);

        // Fuzzy match resolved "PCMC" → PCMC School (id=101) ≠ DY Patil (id=202)
        assertTrue(result.contains("ACCESS DENIED"),
                "Fuzzy 'PCMC' must resolve to PCMC School and trigger ACCESS DENIED for DY Patil teacher");
        assertFalse(result.contains("Onkar"),
                "Must NOT return DY Patil student Onkar when access is denied");
        verify(teacherAssignmentResolver, never()).resolveAssignedStudents(any(), any());
        verify(studentRepository, never()).findBySchoolId(any());
    }

    // ── EXACT ORIGINAL BUG SCENARIO: "Give me list of students of PCMC school" ──

    @Test
    @DisplayName("EXACT ORIGINAL BUG — DY Patil teacher: 'Give me list of students of PCMC school' → ACCESS DENIED, no DY Patil data")
    void exactOriginalBug_dyPatilTeacherAsksPcmcStudents_accessDenied() {
        // This is the precise scenario that was reported as broken.
        // schoolName = "PCMC school" as would be extracted by the IntentClassifier.
        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "PCMC school");
        params.put("entityType", "students");

        // Exact name lookup misses ("PCMC school" ≠ "PCMC School" due to case)
        when(schoolRepository.findByName("PCMC school")).thenReturn(Optional.empty());
        when(schoolRepository.findByNameIgnoreCase("PCMC school")).thenReturn(Optional.empty());
        // Fuzzy: schoolKey("PCMC school")="pcmcschool", schoolKey("PCMC School")="pcmcschool" → MATCH
        when(schoolRepository.findAll()).thenReturn(List.of(pcmcSchool, dyPatilSchool));

        String result = provider.provide(dyPatilTeacherActor, params);

        // THE CORE ASSERTION: must be ACCESS DENIED, not DY Patil students
        assertTrue(result.contains("ACCESS DENIED"),
                "EXACT BUG: DY Patil teacher asking 'PCMC school students' MUST get ACCESS DENIED");
        assertFalse(result.contains("Onkar"),
                "EXACT BUG: DY Patil student Onkar must NOT be returned");
        assertFalse(result.contains("Yash"),
                "EXACT BUG: No student records must be returned");

        // Authorization must stop ALL data retrieval
        verify(teacherAssignmentResolver, never()).resolveAssignedStudents(any(), any());
        verify(studentRepository, never()).findBySchoolId(any());
        verify(studentRepository, never()).findAll();
    }
}
