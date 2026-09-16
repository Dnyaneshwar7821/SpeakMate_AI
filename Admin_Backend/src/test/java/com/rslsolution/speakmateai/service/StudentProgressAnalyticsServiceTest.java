package com.rslsolution.speakmateai.service;

import java.time.LocalDateTime;
import java.util.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.rslsolution.speakmateai.dto.response.analytics.*;
import com.rslsolution.speakmateai.entity.*;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.impl.StudentProgressAnalyticsServiceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class StudentProgressAnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private ProgressRepository progressRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private LessonProgressRepository lessonProgressRepository;

    @Mock
    private SpeakingSessionRepository speakingSessionRepository;

    @Mock
    private ConversationFeedbackRepository conversationFeedbackRepository;

    @Mock
    private GrammarHistoryRepository grammarHistoryRepository;

    @Mock
    private VocabularyRepository vocabularyRepository;

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private AssignmentProgressRepository assignmentProgressRepository;

    @InjectMocks
    private StudentProgressAnalyticsServiceImpl analyticsService;

    private User sampleUser;
    private Progress sampleProgress;

    @BeforeEach
    void setUp() {
        sampleUser = new Student();
        sampleUser.setId(101L);
        sampleUser.setFirstName("Rahul");
        sampleUser.setLastName("Sharma");
        sampleUser.setEmail("rahul@example.com");
        sampleUser.setRole(Role.STUDENT);
        sampleUser.setStatus(Status.ACTIVE);
        sampleUser.setActive(true);
        sampleUser.setLearningGoal("Improve Conversational English");
        sampleUser.setDailyGoalMinutes(20);
        sampleUser.setEnglishLevel("Intermediate");
        sampleUser.setCreatedAt(LocalDateTime.now().minusDays(15));

        sampleProgress = Progress.builder()
                .id(1L)
                .user(sampleUser)
                .xp(750)
                .level(2)
                .currentStreak(4)
                .longestStreak(6)
                .totalPracticeMinutes(85)
                .build();
    }

    @Test
    void testStudentProgressProfile_NoActivity_ShouldReturnNoActivityAndGettingStarted() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.empty());
        when(lessonRepository.countByActiveTrue()).thenReturn(20L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        assertNotNull(response);
        assertEquals(ActivityStatus.NO_ACTIVITY, response.getEngagement().getActivityStatus());
        assertEquals(LearningPhase.GETTING_STARTED, response.getLearningPhase().getPhase());
        assertEquals(0, response.getSummary().getTotalSpeakingSessions());
        assertEquals(0, response.getSummary().getTotalGrammarChecks());
        assertEquals(0, response.getSummary().getTotalVocabularyWords());
        assertEquals(0, response.getSummary().getCompletedLessons());
        assertEquals(20, response.getSummary().getTotalActiveLessons());
    }

    @Test
    void testVocabularyMasteredBugFix_FavoriteDoesNotCountAsMastered_MasteredDoesCount() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());

        // Create 3 words:
        // Word 1: favorite=true, mastered=false (must NOT count as mastered)
        // Word 2: favorite=false, mastered=true (MUST count as mastered)
        // Word 3: favorite=false, mastered=false (neither)
        Vocabulary v1 = Vocabulary.builder().id(1L).word("Ephemeral").favorite(true).mastered(false).createdAt(LocalDateTime.now()).build();
        Vocabulary v2 = Vocabulary.builder().id(2L).word("Resilient").favorite(false).mastered(true).createdAt(LocalDateTime.now()).build();
        Vocabulary v3 = Vocabulary.builder().id(3L).word("Articulate").favorite(false).mastered(false).createdAt(LocalDateTime.now()).build();

        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(List.of(v1, v2, v3));

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        assertNotNull(response);
        assertEquals(3, response.getVocabulary().getTotalWords());
        assertEquals(1, response.getVocabulary().getMasteredWords(), "Only mastered=true should count as mastered");
        assertEquals(2, response.getVocabulary().getLearningWords());
        assertEquals(33.3, response.getVocabulary().getMasteryPercentage(), 0.1);
        assertEquals(1, response.getSummary().getMasteredVocabularyWords());
    }

    @Test
    void testLessonAnalytics_CalculatesCompleted_InProgress_NotStarted_Accurately() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(15L);

        Lesson l1 = Lesson.builder().id(1L).title("Greeting Basics").build();
        Lesson l2 = Lesson.builder().id(2L).title("Ordering Food").build();
        Lesson l3 = Lesson.builder().id(3L).title("Travel Directions").build();

        LessonProgress lp1 = LessonProgress.builder().id(1L).lesson(l1).completed(true).progressPercent(100).timeSpentMinutes(20).build();
        LessonProgress lp2 = LessonProgress.builder().id(2L).lesson(l2).completed(false).progressPercent(50).timeSpentMinutes(10).build();
        LessonProgress lp3 = LessonProgress.builder().id(3L).lesson(l3).completed(false).progressPercent(0).timeSpentMinutes(0).build();

        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(List.of(lp1, lp2, lp3));
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        assertNotNull(response);
        LessonAnalyticsDto lessons = response.getLessons();
        assertEquals(15, lessons.getTotalActiveLessons(), "Denominator must come from real catalogue count");
        assertEquals(1, lessons.getCompletedLessons());
        assertEquals(1, lessons.getInProgressLessons());
        assertEquals(13, lessons.getNotStartedLessons()); // 15 - 1 - 1 = 13
        assertEquals(6.7, lessons.getCompletionPercentage(), 0.1);
        assertEquals(30, lessons.getTotalLessonTimeMinutes());
    }

    @Test
    void testSpeakingAnalytics_NoSyntheticOffsets_ReturnsNullWhenSubScoresNull() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        // A speaking session with only overallScore, but null fluency and pronunciation
        SpeakingSession s = SpeakingSession.builder()
                .id(1L)
                .user(sampleUser)
                .overallScore(80.0)
                .fluencyScore(null)
                .pronunciationScore(null)
                .duration(300)
                .completed(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(List.of(s));

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        SpeakingAnalyticsDto speaking = response.getSpeaking();
        assertEquals(80.0, speaking.getAverageOverallScore());
        assertNull(speaking.getAverageFluencyScore(), "Fluency must be null, never fabricated from overallScore - 4");
        assertNull(speaking.getAveragePronunciationScore(), "Pronunciation must be null, never fabricated from overallScore + 2");
        assertEquals(1, speaking.getTotalSessions());
        assertEquals(1, speaking.getCompletedSessions());
        assertEquals(5, speaking.getTotalSpeakingMinutes());
    }

    @Test
    void testSpeakingTrend_Improving_WhenRecentSessionsAreHigher() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        // 5 sessions (ordered descending: newest first)
        // Recent 3: 88, 85, 85 (avg = 86.0)
        // Previous 2: 70, 72 (avg = 71.0)
        // Change = +15.0% -> IMPROVING
        LocalDateTime now = LocalDateTime.now();
        List<SpeakingSession> sessions = List.of(
                SpeakingSession.builder().id(5L).overallScore(88.0).createdAt(now.minusDays(1)).completed(true).build(),
                SpeakingSession.builder().id(4L).overallScore(85.0).createdAt(now.minusDays(2)).completed(true).build(),
                SpeakingSession.builder().id(3L).overallScore(85.0).createdAt(now.minusDays(3)).completed(true).build(),
                SpeakingSession.builder().id(2L).overallScore(70.0).createdAt(now.minusDays(5)).completed(true).build(),
                SpeakingSession.builder().id(1L).overallScore(72.0).createdAt(now.minusDays(6)).completed(true).build()
        );

        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(sessions);

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        SpeakingAnalyticsDto.SpeakingTrendDto trend = response.getSpeaking().getSpeakingTrend();
        assertNotNull(trend);
        assertEquals(TrendDirection.IMPROVING, trend.getTrendDirection());
        assertEquals(86.0, trend.getRecentAverage());
        assertEquals(71.0, trend.getPreviousAverage());
        assertTrue(trend.getChange() > 2.0);
    }

    @Test
    void testGrammarTrend_InsufficientData_WhenLessThan4Checks() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        List<GrammarHistory> checks = List.of(
                GrammarHistory.builder().id(1L).grammarScore(80.0).createdAt(LocalDateTime.now().minusDays(1)).build(),
                GrammarHistory.builder().id(2L).grammarScore(85.0).createdAt(LocalDateTime.now().minusDays(2)).build()
        );
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(checks);

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        GrammarAnalyticsDto.GrammarTrendDto trend = response.getGrammar().getGrammarTrend();
        assertEquals(TrendDirection.INSUFFICIENT_DATA, trend.getTrendDirection());
        assertEquals(2, response.getGrammar().getTotalChecks());
    }

    @Test
    void testActivityStatus_Transitions_Active_RecentlyActive_Inactive() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        // Active within 3 days -> ACTIVE
        SpeakingSession recent = SpeakingSession.builder().id(1L).createdAt(LocalDateTime.now().minusDays(3)).overallScore(75.0).build();
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(List.of(recent));
        StudentProgressProfileResponse activeResp = analyticsService.getStudentProgressProfile(101L);
        assertEquals(ActivityStatus.ACTIVE, activeResp.getEngagement().getActivityStatus());

        // Active 18 days ago -> RECENTLY_ACTIVE
        SpeakingSession medium = SpeakingSession.builder().id(2L).createdAt(LocalDateTime.now().minusDays(18)).overallScore(75.0).build();
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(List.of(medium));
        StudentProgressProfileResponse recentResp = analyticsService.getStudentProgressProfile(101L);
        assertEquals(ActivityStatus.RECENTLY_ACTIVE, recentResp.getEngagement().getActivityStatus());

        // Active 45 days ago -> INACTIVE
        SpeakingSession old = SpeakingSession.builder().id(3L).createdAt(LocalDateTime.now().minusDays(45)).overallScore(75.0).build();
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(List.of(old));
        StudentProgressProfileResponse inactiveResp = analyticsService.getStudentProgressProfile(101L);
        assertEquals(ActivityStatus.INACTIVE, inactiveResp.getEngagement().getActivityStatus());
    }

    @Test
    void testSchoolAssessments_SafelyHandlesDivisionByZero() {
        sampleUser.setSchoolId(501L);
        sampleUser.setSchoolName("Greenwood High");

        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        // Result 1: 45 / 50 (90%)
        // Result 2: 0 / 0 (must be guarded against ArithmeticException)
        Result r1 = Result.builder().id(1L).testTitle("Unit Test 1").marksObtained(45.0).totalMarks(50.0).status("PASS").submittedAt(LocalDateTime.now()).build();
        Result r2 = Result.builder().id(2L).testTitle("Corrupt Test").marksObtained(0.0).totalMarks(0.0).status("PENDING").submittedAt(LocalDateTime.now()).build();

        when(resultRepository.findByStudent(sampleUser)).thenReturn(List.of(r1, r2));

        StudentProgressProfileResponse response = analyticsService.getStudentProgressProfile(101L);

        SchoolAssessmentsDto assessments = response.getAssessments();
        assertTrue(assessments.isSchoolStudent());
        assertEquals(2, assessments.getTotalTests());
        assertEquals(1, assessments.getCompletedTests());
        assertEquals(90.0, assessments.getAverageTestPercentage());
    }

    @Test
    void testGetStudentLessonsDetail_MapsCatalogueToStudentProgress() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));

        Lesson l1 = Lesson.builder().id(10L).title("Lesson A").category("Grammar").level("Beginner").orderIndex(1).xpReward(35).build();
        Lesson l2 = Lesson.builder().id(20L).title("Lesson B").category("Speaking").level("Intermediate").orderIndex(2).xpReward(50).build();
        when(lessonRepository.findByActiveTrue()).thenReturn(List.of(l1, l2));

        LessonProgress lp1 = LessonProgress.builder().lesson(l1).completed(true).progressPercent(100).timeSpentMinutes(15).build();
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(List.of(lp1));

        List<LessonDetailProgressDto> detail = analyticsService.getStudentLessonsDetail(101L);

        assertEquals(2, detail.size());
        assertEquals("COMPLETED", detail.get(0).getStatus());
        assertEquals(100, detail.get(0).getProgressPercent());
        assertEquals("NOT_STARTED", detail.get(1).getStatus());
        assertEquals(0, detail.get(1).getProgressPercent());
    }

    @Test
    void testUserNotFound_ThrowsException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> analyticsService.getStudentProgressProfile(999L));
    }
    @Test
    void testSpeakingTrend_DecliningAndStable() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        // Declining: Recent 3 avg = 60.0, Previous 2 avg = 75.0 (change = -15.0%)
        LocalDateTime now = LocalDateTime.now();
        List<SpeakingSession> decliningSessions = List.of(
                SpeakingSession.builder().id(5L).overallScore(60.0).createdAt(now.minusDays(1)).completed(true).build(),
                SpeakingSession.builder().id(4L).overallScore(60.0).createdAt(now.minusDays(2)).completed(true).build(),
                SpeakingSession.builder().id(3L).overallScore(60.0).createdAt(now.minusDays(3)).completed(true).build(),
                SpeakingSession.builder().id(2L).overallScore(75.0).createdAt(now.minusDays(5)).completed(true).build(),
                SpeakingSession.builder().id(1L).overallScore(75.0).createdAt(now.minusDays(6)).completed(true).build()
        );
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(decliningSessions);

        StudentProgressProfileResponse decResp = analyticsService.getStudentProgressProfile(101L);
        assertEquals(TrendDirection.DECLINING, decResp.getSpeaking().getSpeakingTrend().getTrendDirection());
        assertTrue(decResp.getSpeaking().getSpeakingTrend().getChange() < -2.0);

        // Stable: Recent 3 avg = 75.0, Previous 2 avg = 75.0 (change = 0.0%)
        List<SpeakingSession> stableSessions = List.of(
                SpeakingSession.builder().id(5L).overallScore(75.0).createdAt(now.minusDays(1)).completed(true).build(),
                SpeakingSession.builder().id(4L).overallScore(75.0).createdAt(now.minusDays(2)).completed(true).build(),
                SpeakingSession.builder().id(3L).overallScore(75.0).createdAt(now.minusDays(3)).completed(true).build(),
                SpeakingSession.builder().id(2L).overallScore(75.0).createdAt(now.minusDays(5)).completed(true).build(),
                SpeakingSession.builder().id(1L).overallScore(75.0).createdAt(now.minusDays(6)).completed(true).build()
        );
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(stableSessions);

        StudentProgressProfileResponse stableResp = analyticsService.getStudentProgressProfile(101L);
        assertEquals(TrendDirection.STABLE, stableResp.getSpeaking().getSpeakingTrend().getTrendDirection());
        assertEquals(0.0, stableResp.getSpeaking().getSpeakingTrend().getChange());
    }

    @Test
    void testGrammarTrend_ImprovingAndDeclining() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        // Improving: Recent 3 = 90, 90, 90; Prev 2 = 70, 70
        LocalDateTime now = LocalDateTime.now();
        List<GrammarHistory> checks = List.of(
                GrammarHistory.builder().id(5L).grammarScore(90.0).createdAt(now.minusDays(1)).build(),
                GrammarHistory.builder().id(4L).grammarScore(90.0).createdAt(now.minusDays(2)).build(),
                GrammarHistory.builder().id(3L).grammarScore(90.0).createdAt(now.minusDays(3)).build(),
                GrammarHistory.builder().id(2L).grammarScore(70.0).createdAt(now.minusDays(5)).build(),
                GrammarHistory.builder().id(1L).grammarScore(70.0).createdAt(now.minusDays(6)).build()
        );
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(checks);

        StudentProgressProfileResponse resp = analyticsService.getStudentProgressProfile(101L);
        assertEquals(TrendDirection.IMPROVING, resp.getGrammar().getGrammarTrend().getTrendDirection());
        assertTrue(resp.getGrammar().getGrammarTrend().getChange() > 2.0);
    }

    @Test
    void testStrengthsAndAttentionAreas_DeterministicGeneration() {
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);

        // High grammar accuracy: 85% avg over 6 checks -> Grammar Precision strength
        List<GrammarHistory> checks = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            checks.add(GrammarHistory.builder().id((long) i).grammarScore(85.0).createdAt(LocalDateTime.now().minusDays(i)).build());
        }
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(checks);

        // Low speaking: 2 sessions with 50% avg -> Speaking attention area
        List<SpeakingSession> sessions = List.of(
                SpeakingSession.builder().id(1L).overallScore(50.0).createdAt(LocalDateTime.now().minusDays(1)).build(),
                SpeakingSession.builder().id(2L).overallScore(50.0).createdAt(LocalDateTime.now().minusDays(2)).build()
        );
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(sessions);

        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());

        StudentProgressProfileResponse resp = analyticsService.getStudentProgressProfile(101L);

        assertNotNull(resp.getStrengths());
        assertTrue(resp.getStrengths().stream().anyMatch(s -> "Grammar Precision".equalsIgnoreCase(s.getArea())));
        assertTrue(resp.getStrengths().stream().anyMatch(s -> "Consistent Habit".equalsIgnoreCase(s.getArea())));

        assertNotNull(resp.getAreasNeedingAttention());
        assertTrue(resp.getAreasNeedingAttention().stream().anyMatch(a -> a.getArea().contains("Speaking")));
    }

    @Test
    void testSchoolAssessments_WithAssignments() {
        sampleUser.setSchoolId(501L);
        when(userRepository.findById(101L)).thenReturn(Optional.of(sampleUser));
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(sampleProgress));
        when(lessonRepository.countByActiveTrue()).thenReturn(10L);
        when(lessonProgressRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(speakingSessionRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(grammarHistoryRepository.findByUserOrderByCreatedAtDesc(sampleUser)).thenReturn(Collections.emptyList());
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(Collections.emptyList());
        when(resultRepository.findByStudent(sampleUser)).thenReturn(Collections.emptyList());

        AssignmentProgress ap1 = AssignmentProgress.builder().id(1L).studentId(101L).status("COMPLETED").score(90).build();
        AssignmentProgress ap2 = AssignmentProgress.builder().id(2L).studentId(101L).status("IN_PROGRESS").build();
        when(assignmentProgressRepository.findByStudentId(101L)).thenReturn(List.of(ap1, ap2));

        StudentProgressProfileResponse resp = analyticsService.getStudentProgressProfile(101L);

        assertNotNull(resp.getAssessments().getAssignmentsSummary());
        assertEquals(2, resp.getAssessments().getAssignmentsSummary().getTotalAssigned());
        assertEquals(1, resp.getAssessments().getAssignmentsSummary().getCompleted());
        assertEquals(1, resp.getAssessments().getAssignmentsSummary().getInProgress());
        assertEquals(90.0, resp.getAssessments().getAssignmentsSummary().getAverageScore());
    }
}
