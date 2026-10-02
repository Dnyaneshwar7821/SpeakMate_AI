package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rslsolution.speakmateai.assistant.ActorContext;
import com.rslsolution.speakmateai.assistant.TeacherAssignmentResolver;
import com.rslsolution.speakmateai.assistant.provider.BillingDataProvider;
import com.rslsolution.speakmateai.assistant.provider.SchoolRosterDataProvider;
import com.rslsolution.speakmateai.assistant.provider.StudentLookupDataProvider;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.StudentRepository;
import com.rslsolution.speakmateai.repository.SubscriptionPlanRepository;
import com.rslsolution.speakmateai.repository.TeacherRepository;
import com.rslsolution.speakmateai.repository.TeacherStandardDivisionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;

class SchoolAdminChatbotSchoolIsolationTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private SchoolRepository schoolRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProgressRepository progressRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private SpeakingSessionRepository speakingSessionRepository;

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private GrammarHistoryRepository grammarHistoryRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private TeacherStandardDivisionRepository teacherStandardDivisionRepository;

    @Mock
    private TeacherAssignmentResolver teacherAssignmentResolver;

    @Mock
    private UserSubscriptionRepository userSubscriptionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private SubscriptionPlanRepository subscriptionPlanRepository;

    private ObjectMapper objectMapper;

    private StudentLookupDataProvider studentLookupDataProvider;
    private SchoolRosterDataProvider schoolRosterDataProvider;
    private BillingDataProvider billingDataProvider;

    private School pcmcSchool;
    private School dyPatilSchool;
    private Student pcmcStudent;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        objectMapper = new ObjectMapper();

        studentLookupDataProvider = new StudentLookupDataProvider(
                schoolRepository,
                studentRepository,
                userRepository,
                progressRepository,
                lessonProgressRepository,
                speakingSessionRepository,
                vocabularyRepository,
                grammarHistoryRepository,
                teacherAssignmentResolver,
                objectMapper
        );

        schoolRosterDataProvider = new SchoolRosterDataProvider(
                schoolRepository,
                userRepository,
                studentRepository,
                teacherRepository,
                teacherStandardDivisionRepository,
                teacherAssignmentResolver,
                progressRepository,
                objectMapper
        );

        billingDataProvider = new BillingDataProvider(
                paymentRepository,
                userSubscriptionRepository,
                subscriptionPlanRepository,
                objectMapper
        );

        pcmcSchool = new School();
        pcmcSchool.setId(101L);
        pcmcSchool.setName("PCMC School");

        dyPatilSchool = new School();
        dyPatilSchool.setId(202L);
        dyPatilSchool.setName("DY Patil University");

        pcmcStudent = new Student();
        pcmcStudent.setId(1L);
        pcmcStudent.setFirstName("Yash");
        pcmcStudent.setLastName("Jadhav");
        pcmcStudent.setSchoolId(101L);
        pcmcStudent.setRole(Role.STUDENT);

        dyPatilSchool = new School();
        dyPatilSchool.setId(202L);
        dyPatilSchool.setName("DY Patil University");
    }

    @Test
    void testStudentLookup_SchoolAdminDeniedForOtherSchool() {
        // Given a School Admin belonging to PCMC School (ID: 101)
        ActorContext actor = ActorContext.builder()
                .userId(50L)
                .role(Role.SCHOOL_ADMIN)
                .schoolId(101L)
                .build();

        // Request names DY Patil University — a different school
        Map<String, Object> params = new HashMap<>();
        params.put("studentName", "Onkar");
        params.put("schoolName", "DY Patil University");

        // resolveSchoolByName / findByNameIgnoreCase returns dyPatilSchool (id=202 ≠ 101)
        when(schoolRepository.findByNameIgnoreCase("DY Patil University")).thenReturn(Optional.of(dyPatilSchool));

        // When
        String jsonResult = studentLookupDataProvider.provide(actor, params);

        // Then: ACCESS DENIED — student repository must never be queried
        assertTrue(jsonResult.contains("ACCESS DENIED"), "Must deny PCMC admin from accessing DY Patil students");
        assertFalse(jsonResult.contains("Onkar"), "Result must NOT contain DY Patil student");
        assertFalse(jsonResult.contains("DY Patil University"), "Result must NOT expose DY Patil school name as data source");
        verify(studentRepository, never()).findBySchoolId(202L);
    }

    @Test
    void testSchoolRoster_SchoolAdminIsolatedToOwnSchool() {
        // Given a School Admin belonging to PCMC School (ID: 101)
        ActorContext actor = ActorContext.builder()
                .userId(50L)
                .role(Role.SCHOOL_ADMIN)
                .schoolId(101L)
                .build();

        Map<String, Object> params = new HashMap<>();
        params.put("schoolName", "DY Patil University");

        when(schoolRepository.findById(101L)).thenReturn(Optional.of(pcmcSchool));
        // resolveSchoolByName("DY Patil University") must resolve to id=202, different from PCMC (101)
        when(schoolRepository.findByName("DY Patil University")).thenReturn(Optional.of(dyPatilSchool));

        // When
        String jsonResult = schoolRosterDataProvider.provide(actor, params);

        // Then
        assertTrue(jsonResult.contains("ACCESS DENIED"), "Result must state ACCESS DENIED when requesting another school");
        assertFalse(jsonResult.contains("Onkar"), "Roster must NOT contain DY Patil student");
    }

    @Test
    void testBillingData_SchoolAdminIsolatedToOwnSchool() {
        // Given a School Admin belonging to PCMC School (ID: 101)
        ActorContext actor = ActorContext.builder()
                .userId(50L)
                .role(Role.SCHOOL_ADMIN)
                .schoolId(101L)
                .build();

        Map<String, Object> params = new HashMap<>();

        when(userSubscriptionRepository.findByUserSchoolId(101L)).thenReturn(List.of());

        // When
        billingDataProvider.provide(actor, params);

        // Then
        verify(userSubscriptionRepository).findByUserSchoolId(101L);
    }
}
