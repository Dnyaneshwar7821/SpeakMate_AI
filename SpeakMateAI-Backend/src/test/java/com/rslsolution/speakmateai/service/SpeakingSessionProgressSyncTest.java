package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.rslsolution.speakmateai.dto.response.AchievementResponse;
import com.rslsolution.speakmateai.dto.response.DashboardSummaryResponse;
import com.rslsolution.speakmateai.dto.response.ProgressResponse;
import com.rslsolution.speakmateai.dto.response.StatisticsResponse;
import com.rslsolution.speakmateai.entity.Achievement;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.impl.AchievementServiceImpl;
import com.rslsolution.speakmateai.service.impl.DashboardServiceImpl;
import com.rslsolution.speakmateai.service.impl.ProgressServiceImpl;

@ExtendWith(MockitoExtension.class)
public class SpeakingSessionProgressSyncTest {

    @Mock private UserRepository userRepository;
    @Mock private ProgressRepository progressRepository;
    @Mock private SpeakingSessionRepository speakingSessionRepository;
    @Mock private VocabularyRepository vocabularyRepository;
    @Mock private GrammarHistoryRepository grammarHistoryRepository;
    @Mock private AchievementRepository achievementRepository;
    @Mock private NotificationService notificationService;
    @Mock private NotificationRepository notificationRepository;
    @Mock private OnboardingRepository onboardingRepository;
    @Mock private ChatHistoryRepository chatHistoryRepository;
    @Mock private LessonRepository lessonRepository;
    @Mock private LessonProgressRepository lessonProgressRepository;
    @Mock private ChatSessionRepository chatSessionRepository;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(152L)
                .email("rohit.patel@example.com")
                .firstName("Rohit")
                .lastName("Patel")
                .role(Role.STUDENT)
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("rohit.patel@example.com");
        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);

        when(userRepository.findByEmail("rohit.patel@example.com")).thenReturn(Optional.of(sampleUser));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("ProgressService auto-heals inflated totalSpeakingSessions (81 down to 6 completed)")
    void testProgressService_AutoHealsInflatedCount() {
        ProgressServiceImpl progressService = new ProgressServiceImpl(
                progressRepository, userRepository,
                speakingSessionRepository, vocabularyRepository, grammarHistoryRepository);

        // Progress record currently has inflated 81
        Progress inflatedProgress = Progress.builder()
                .id(1L)
                .user(sampleUser)
                .xp(1000)
                .totalSpeakingSessions(81)
                .totalGrammarChecks(5)
                .totalVocabularyWords(10)
                .build();

        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(inflatedProgress));
        when(progressRepository.save(any(Progress.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Neon DB has 6 completed sessions
        when(speakingSessionRepository.countByUserAndCompletedTrue(sampleUser)).thenReturn(6L);
        when(vocabularyRepository.countByUser(sampleUser)).thenReturn(10L);
        when(grammarHistoryRepository.countByUserId(152L)).thenReturn(5L);

        ProgressResponse res = progressService.getProgress();

        assertNotNull(res);
        assertEquals(6, res.getTotalSpeakingSessions(), "ProgressService must return verified completed speaking sessions (6), not 81.");
        assertEquals(6, inflatedProgress.getTotalSpeakingSessions(), "Database progress entity must be healed to 6.");
    }

    @Test
    @DisplayName("AchievementService re-locks higher speaking achievements when count is 6")
    void testAchievementService_RelocksPrematureAchievements() {
        AchievementServiceImpl achievementService = new AchievementServiceImpl(
                achievementRepository, userRepository, progressRepository,
                notificationService, speakingSessionRepository);

        Progress progress = Progress.builder()
                .id(1L)
                .user(sampleUser)
                .xp(1000)
                .totalSpeakingSessions(81) // previously inflated
                .build();

        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(progress));
        when(progressRepository.save(any(Progress.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(speakingSessionRepository.countByUserAndCompletedTrue(sampleUser)).thenReturn(6L);

        // All 4 achievements were previously unlocked due to 81
        List<Achievement> existingAchievements = List.of(
                Achievement.builder().id(1L).user(sampleUser).tier(1).title("First Voice Conversation").xpReward(50).unlocked(true).build(),
                Achievement.builder().id(2L).user(sampleUser).tier(2).title("Confident Conversationalist").xpReward(120).unlocked(true).build(),
                Achievement.builder().id(3L).user(sampleUser).tier(3).title("Fluency Champion").xpReward(250).unlocked(true).build(),
                Achievement.builder().id(4L).user(sampleUser).tier(4).title("Orator Supreme").xpReward(500).unlocked(true).build()
        );
        when(achievementRepository.findByUser(sampleUser)).thenReturn(existingAchievements);
        when(achievementRepository.save(any(Achievement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<AchievementResponse> results = achievementService.getAllAchievements();

        // 1 session -> Unlocked
        AchievementResponse first = results.stream().filter(a -> a.getTitle().equals("First Voice Conversation")).findFirst().orElseThrow();
        assertTrue(first.getUnlocked(), "1 session target should remain unlocked for 6 completed sessions.");

        // 5 sessions -> Unlocked
        AchievementResponse conf = results.stream().filter(a -> a.getTitle().equals("Confident Conversationalist")).findFirst().orElseThrow();
        assertTrue(conf.getUnlocked(), "5 sessions target should remain unlocked for 6 completed sessions.");

        // 15 sessions -> Re-locked!
        AchievementResponse fluency = results.stream().filter(a -> a.getTitle().equals("Fluency Champion")).findFirst().orElseThrow();
        assertFalse(fluency.getUnlocked(), "15 sessions target should be re-locked since user has 6 completed sessions.");

        // 30 sessions -> Re-locked!
        AchievementResponse orator = results.stream().filter(a -> a.getTitle().equals("Orator Supreme")).findFirst().orElseThrow();
        assertFalse(orator.getUnlocked(), "30 sessions target should be re-locked since user has 6 completed sessions.");
    }

    @Test
    @DisplayName("DashboardService getStatistics reports only completed speaking sessions")
    void testDashboardService_StatisticsOnlyCompleted() {
        DashboardServiceImpl dashboardService = new DashboardServiceImpl(
                userRepository, progressRepository, onboardingRepository,
                speakingSessionRepository, vocabularyRepository, grammarHistoryRepository,
                chatHistoryRepository, lessonRepository, lessonProgressRepository,
                achievementRepository, notificationRepository, chatSessionRepository);

        Progress progress = Progress.builder()
                .id(1L)
                .user(sampleUser)
                .xp(1000)
                .totalSpeakingSessions(81) // inflated
                .build();
        when(progressRepository.findByUser(sampleUser)).thenReturn(Optional.of(progress));

        List<SpeakingSession> completedSessions = List.of(
                SpeakingSession.builder().id(1L).overallScore(80.0).duration(120).completed(true).build(),
                SpeakingSession.builder().id(2L).overallScore(85.0).duration(150).completed(true).build(),
                SpeakingSession.builder().id(3L).overallScore(90.0).duration(180).completed(true).build(),
                SpeakingSession.builder().id(4L).overallScore(75.0).duration(200).completed(true).build(),
                SpeakingSession.builder().id(5L).overallScore(82.0).duration(160).completed(true).build(),
                SpeakingSession.builder().id(6L).overallScore(88.0).duration(140).completed(true).build()
        );
        when(speakingSessionRepository.findByUserAndCompletedTrue(sampleUser)).thenReturn(completedSessions);
        when(vocabularyRepository.findByUser(sampleUser)).thenReturn(List.of());
        when(grammarHistoryRepository.findByUser(sampleUser)).thenReturn(List.of());
        when(lessonRepository.findByActiveTrue()).thenReturn(List.of());
        when(lessonProgressRepository.findByUserAndCompleted(sampleUser, true)).thenReturn(List.of());

        StatisticsResponse stats = dashboardService.getStatistics();

        assertEquals(6, stats.getSpeakingSessions(), "Dashboard statistics must report 6 completed sessions, not 81 attempted.");
    }
}
