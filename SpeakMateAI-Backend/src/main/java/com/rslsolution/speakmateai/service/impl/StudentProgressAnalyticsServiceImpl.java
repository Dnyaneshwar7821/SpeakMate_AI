package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.analytics.*;
import com.rslsolution.speakmateai.entity.*;
import com.rslsolution.speakmateai.repository.*;
import com.rslsolution.speakmateai.service.StudentProgressAnalyticsService;

@Service
@Transactional(readOnly = true)
public class StudentProgressAnalyticsServiceImpl implements StudentProgressAnalyticsService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final ProgressRepository progressRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final SpeakingSessionRepository speakingSessionRepository;
    private final ConversationFeedbackRepository conversationFeedbackRepository;
    private final GrammarHistoryRepository grammarHistoryRepository;
    private final VocabularyRepository vocabularyRepository;
    private final ResultRepository resultRepository;
    private final AssignmentProgressRepository assignmentProgressRepository;

    @Autowired
    public StudentProgressAnalyticsServiceImpl(
            UserRepository userRepository,
            @Autowired(required = false) StudentRepository studentRepository,
            @Autowired(required = false) TeacherRepository teacherRepository,
            ProgressRepository progressRepository,
            LessonRepository lessonRepository,
            LessonProgressRepository lessonProgressRepository,
            SpeakingSessionRepository speakingSessionRepository,
            @Autowired(required = false) ConversationFeedbackRepository conversationFeedbackRepository,
            @Autowired(required = false) GrammarHistoryRepository grammarHistoryRepository,
            @Autowired(required = false) VocabularyRepository vocabularyRepository,
            @Autowired(required = false) ResultRepository resultRepository,
            @Autowired(required = false) AssignmentProgressRepository assignmentProgressRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.progressRepository = progressRepository;
        this.lessonRepository = lessonRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.speakingSessionRepository = speakingSessionRepository;
        this.conversationFeedbackRepository = conversationFeedbackRepository;
        this.grammarHistoryRepository = grammarHistoryRepository;
        this.vocabularyRepository = vocabularyRepository;
        this.resultRepository = resultRepository;
        this.assignmentProgressRepository = assignmentProgressRepository;
    }

    @Override
    public StudentProgressProfileResponse getStudentProgressProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // 1. Student Summary
        Student studentEntity = null;
        if (user instanceof Student s) {
            studentEntity = s;
        } else if (studentRepository != null) {
            studentEntity = studentRepository.findById(userId).orElse(null);
        }

        String teacherName = null;
        Long teacherId = studentEntity != null ? studentEntity.getTeacherId() : null;
        if (teacherId != null) {
            if (teacherRepository != null) {
                teacherName = teacherRepository.findById(teacherId)
                        .map(t -> ((t.getFirstName() != null ? t.getFirstName() : "") + " "
                                + (t.getLastName() != null ? t.getLastName() : "")).trim())
                        .filter(s -> !s.isBlank())
                        .orElse(null);
            }
            if (teacherName == null && userRepository != null) {
                teacherName = userRepository.findById(teacherId)
                        .map(t -> ((t.getFirstName() != null ? t.getFirstName() : "") + " "
                                + (t.getLastName() != null ? t.getLastName() : "")).trim())
                        .filter(s -> !s.isBlank())
                        .orElse(null);
            }
        }

        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();
        if (fullName.isEmpty()) {
            fullName = user.getEmail();
        }

        StudentSummaryDto studentSummary = StudentSummaryDto.builder()
                .id(user.getId())
                .studentId(studentEntity != null ? studentEntity.getStudentId() : null)
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "STUDENT")
                .accountStatus(user.getStatus() != null ? user.getStatus().name() : (user.isActive() ? "ACTIVE" : "INACTIVE"))
                .active(user.isActive())
                .learningGoal(user.getLearningGoal())
                .dailyGoalMinutes(user.getDailyGoalMinutes())
                .englishLevel(user.getEnglishLevel())
                .schoolId(studentEntity != null && studentEntity.getSchoolId() != null ? studentEntity.getSchoolId() : user.getSchoolId())
                .schoolName(studentEntity != null && studentEntity.getSchoolName() != null ? studentEntity.getSchoolName() : user.getSchoolName())
                .standard(studentEntity != null && studentEntity.getStandard() != null ? studentEntity.getStandard() : user.getStandard())
                .division(studentEntity != null && studentEntity.getDivision() != null ? studentEntity.getDivision() : user.getDivision())
                .rollNumber(studentEntity != null && studentEntity.getRollNumber() != null ? studentEntity.getRollNumber() : user.getRollNumber())
                .teacherId(teacherId)
                .teacherName(teacherName)
                .assignedTeacher(teacherName)
                .registeredAt(user.getCreatedAt())
                .build();

        // 2. Base Progress Entity
        Progress progress = progressRepository.findByUser(user).orElse(null);
        int totalXp = progress != null && progress.getXp() != null ? progress.getXp() : 0;
        int currentLevel = progress != null && progress.getLevel() != null ? progress.getLevel() : Math.max(1, (totalXp / 500) + 1);
        int currentStreak = progress != null && progress.getCurrentStreak() != null ? progress.getCurrentStreak() : 0;
        int longestStreak = progress != null && progress.getLongestStreak() != null ? progress.getLongestStreak() : currentStreak;

        // 3. Lesson Analytics
        long totalActiveLessonsCount = lessonRepository.countByActiveTrue();
        int totalActiveLessons = (int) totalActiveLessonsCount;
        List<LessonProgress> lessonProgressList = lessonProgressRepository.findByUser(user);
        if (lessonProgressList == null) {
            lessonProgressList = Collections.emptyList();
        }

        int completedLessons = (int) lessonProgressList.stream()
                .filter(lp -> Boolean.TRUE.equals(lp.getCompleted()) || (lp.getProgressPercent() != null && lp.getProgressPercent() == 100))
                .count();

        int inProgressLessons = (int) lessonProgressList.stream()
                .filter(lp -> !Boolean.TRUE.equals(lp.getCompleted()) && lp.getProgressPercent() != null && lp.getProgressPercent() > 0 && lp.getProgressPercent() < 100)
                .count();

        int notStartedLessons = Math.max(0, totalActiveLessons - completedLessons - inProgressLessons);
        double lessonCompletionPercentage = totalActiveLessons > 0 ? ((double) completedLessons / totalActiveLessons) * 100.0 : 0.0;
        int totalLessonTimeMinutes = lessonProgressList.stream()
                .filter(lp -> lp.getTimeSpentMinutes() != null)
                .mapToInt(LessonProgress::getTimeSpentMinutes)
                .sum();

        List<LessonAnalyticsDto.RecentCompletedLessonDto> recentlyCompleted = lessonProgressList.stream()
                .filter(lp -> Boolean.TRUE.equals(lp.getCompleted()) || (lp.getProgressPercent() != null && lp.getProgressPercent() == 100))
                .sorted(Comparator.comparing(LessonProgress::getCompletedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .map(lp -> LessonAnalyticsDto.RecentCompletedLessonDto.builder()
                        .lessonId(lp.getLesson() != null ? lp.getLesson().getId() : null)
                        .title(lp.getLesson() != null ? lp.getLesson().getTitle() : "Lesson")
                        .category(lp.getLesson() != null ? lp.getLesson().getCategory() : null)
                        .level(lp.getLesson() != null ? lp.getLesson().getLevel() : null)
                        .progressPercent(lp.getProgressPercent() != null ? lp.getProgressPercent() : 100)
                        .timeSpentMinutes(lp.getTimeSpentMinutes() != null ? lp.getTimeSpentMinutes() : 0)
                        .completedAt(lp.getCompletedAt() != null ? lp.getCompletedAt() : lp.getUpdatedAt())
                        .xpEarned(lp.getXpEarned() != null ? lp.getXpEarned() : (lp.getLesson() != null && lp.getLesson().getXpReward() != null ? lp.getLesson().getXpReward() : 35))
                        .build())
                .collect(Collectors.toList());

        LessonAnalyticsDto lessonAnalytics = LessonAnalyticsDto.builder()
                .totalActiveLessons(totalActiveLessons)
                .completedLessons(completedLessons)
                .inProgressLessons(inProgressLessons)
                .notStartedLessons(notStartedLessons)
                .completionPercentage(roundOneDecimal(lessonCompletionPercentage))
                .totalLessonTimeMinutes(totalLessonTimeMinutes)
                .recentlyCompletedLessons(recentlyCompleted)
                .build();

        // 4. Speaking Analytics
        List<SpeakingSession> speakingSessions = speakingSessionRepository.findByUserOrderByCreatedAtDesc(user);
        if (speakingSessions == null) {
            speakingSessions = Collections.emptyList();
        }

        int totalSpeakingSessions = speakingSessions.size();
        int completedSpeakingSessions = (int) speakingSessions.stream()
                .filter(s -> Boolean.TRUE.equals(s.getCompleted()))
                .count();

        int totalSpeakingSeconds = speakingSessions.stream()
                .filter(s -> s.getDuration() != null)
                .mapToInt(SpeakingSession::getDuration)
                .sum();
        int totalSpeakingMinutes = totalSpeakingSeconds / 60;

        // Filter sessions that have real evaluated speech results (exclude abandoned/un-scored sessions)
        List<SpeakingSession> scoredSessions = speakingSessions.stream()
                .filter(this::isEvaluatedSpeakingSession)
                .toList();

        Double avgOverallScore = averageScore(scoredSessions.stream()
                .map(this::getEvaluatedSpeakingScore)
                .filter(Objects::nonNull).toList());

        Double avgFluencyScore = averageScore(scoredSessions.stream()
                .map(SpeakingSession::getFluencyScore)
                .filter(s -> s != null && s > 0).toList());

        Double avgPronunciationScore = averageScore(scoredSessions.stream()
                .map(SpeakingSession::getPronunciationScore)
                .filter(s -> s != null && s > 0).toList());

        Double avgGrammarScoreFromSpeaking = averageScore(scoredSessions.stream()
                .map(SpeakingSession::getGrammarScore)
                .filter(s -> s != null && s > 0).toList());

        Double avgVocabScoreFromSpeaking = averageScore(scoredSessions.stream()
                .map(SpeakingSession::getVocabularyScore)
                .filter(s -> s != null && s > 0).toList());

        Double bestSpeakingScore = scoredSessions.stream()
                .map(this::getEvaluatedSpeakingScore)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);

        // Speaking Trend Calculation (Latest 3 valid sessions vs preceding valid sessions)
        SpeakingAnalyticsDto.SpeakingTrendDto speakingTrend;
        if (scoredSessions.size() < 4) {
            speakingTrend = SpeakingAnalyticsDto.SpeakingTrendDto.builder()
                    .trendDirection(TrendDirection.INSUFFICIENT_DATA)
                    .recentAverage(scoredSessions.isEmpty() ? null : roundOneDecimal(getEvaluatedSpeakingScore(scoredSessions.get(0))))
                    .previousAverage(null)
                    .change(null)
                    .description("At least 4 scored speaking sessions are required to evaluate a trend.")
                    .build();
        } else {
            List<SpeakingSession> recent3 = scoredSessions.subList(0, 3);
            List<SpeakingSession> previousList = scoredSessions.subList(3, scoredSessions.size());

            double recentAvg = recent3.stream()
                    .mapToDouble(this::getEvaluatedSpeakingScore)
                    .average().orElse(0.0);
            double prevAvg = previousList.stream()
                    .mapToDouble(this::getEvaluatedSpeakingScore)
                    .average().orElse(0.0);

            double change = roundOneDecimal(recentAvg - prevAvg);
            TrendDirection dir;
            String desc;
            if (change > 2.0) {
                dir = TrendDirection.IMPROVING;
                desc = "Speaking performance has improved by +" + change + "% across recent sessions.";
            } else if (change < -2.0) {
                dir = TrendDirection.DECLINING;
                desc = "Speaking performance has declined by " + change + "% across recent sessions.";
            } else {
                dir = TrendDirection.STABLE;
                desc = "Speaking performance remains steady within a +/-2% margin.";
            }

            speakingTrend = SpeakingAnalyticsDto.SpeakingTrendDto.builder()
                    .trendDirection(dir)
                    .recentAverage(roundOneDecimal(recentAvg))
                    .previousAverage(roundOneDecimal(prevAvg))
                    .change(change)
                    .description(desc)
                    .build();
        }

        List<SpeakingAnalyticsDto.RecentSpeakingSessionDto> recentSpeakingList = speakingSessions.stream()
                .limit(10)
                .map(s -> {
                    String feedbackSummary = null;
                    if (conversationFeedbackRepository != null) {
                        try {
                            ConversationFeedback fb = conversationFeedbackRepository.findBySession(s).orElse(null);
                            if (fb != null && fb.getSummary() != null && !fb.getSummary().isBlank()) {
                                feedbackSummary = fb.getSummary();
                            }
                        } catch (Exception ignored) {}
                    }
                    if (feedbackSummary == null && s.getFeedback() != null && !s.getFeedback().isBlank()) {
                        feedbackSummary = s.getFeedback();
                    }

                    return SpeakingAnalyticsDto.RecentSpeakingSessionDto.builder()
                            .sessionId(s.getId())
                            .date(s.getCreatedAt())
                            .scenario(s.getScenario() != null ? s.getScenario() : s.getTopic())
                            .topic(s.getTopic())
                            .durationSeconds(s.getDuration())
                            .overallScore(getEvaluatedSpeakingScore(s))
                            .fluencyScore(s.getFluencyScore())
                            .pronunciationScore(s.getPronunciationScore())
                            .grammarScore(s.getGrammarScore())
                            .vocabularyScore(s.getVocabularyScore())
                            .xpEarned(s.getXpEarned())
                            .completed(s.getCompleted())
                            .feedbackSummary(feedbackSummary)
                            .build();
                })
                .collect(Collectors.toList());

        SpeakingAnalyticsDto speakingAnalytics = SpeakingAnalyticsDto.builder()
                .totalSessions(totalSpeakingSessions)
                .completedSessions(completedSpeakingSessions)
                .totalSpeakingMinutes(totalSpeakingMinutes)
                .averageOverallScore(avgOverallScore)
                .averageFluencyScore(avgFluencyScore)
                .averagePronunciationScore(avgPronunciationScore)
                .averageGrammarScore(avgGrammarScoreFromSpeaking)
                .averageVocabularyScore(avgVocabScoreFromSpeaking)
                .bestScore(bestSpeakingScore != null ? roundOneDecimal(bestSpeakingScore) : null)
                .speakingTrend(speakingTrend)
                .recentSessions(recentSpeakingList)
                .build();

        // 5. Grammar Analytics
        List<GrammarHistory> grammarList = Collections.emptyList();
        if (grammarHistoryRepository != null) {
            grammarList = grammarHistoryRepository.findByUserOrderByCreatedAtDesc(user);
            if (grammarList == null) grammarList = Collections.emptyList();
        }

        int totalGrammarChecks = grammarList.size();
        Double avgGrammarScore = averageScore(grammarList.stream()
                .map(GrammarHistory::getGrammarScore)
                .filter(Objects::nonNull).toList());

        GrammarAnalyticsDto.GrammarTrendDto grammarTrend;
        List<GrammarHistory> scoredGrammar = grammarList.stream()
                .filter(g -> g.getGrammarScore() != null)
                .toList();

        if (scoredGrammar.size() < 4) {
            grammarTrend = GrammarAnalyticsDto.GrammarTrendDto.builder()
                    .trendDirection(TrendDirection.INSUFFICIENT_DATA)
                    .recentAverage(scoredGrammar.isEmpty() ? null : roundOneDecimal(scoredGrammar.get(0).getGrammarScore()))
                    .previousAverage(null)
                    .change(null)
                    .description("At least 4 grammar checks are required to evaluate a trend.")
                    .build();
        } else {
            List<GrammarHistory> recent3 = scoredGrammar.subList(0, 3);
            List<GrammarHistory> previousList = scoredGrammar.subList(3, scoredGrammar.size());

            double recentAvg = recent3.stream().mapToDouble(GrammarHistory::getGrammarScore).average().orElse(0.0);
            double prevAvg = previousList.stream().mapToDouble(GrammarHistory::getGrammarScore).average().orElse(0.0);
            double change = roundOneDecimal(recentAvg - prevAvg);

            TrendDirection dir;
            String desc;
            if (change > 2.0) {
                dir = TrendDirection.IMPROVING;
                desc = "Grammar accuracy improved by +" + change + "% over recent checks.";
            } else if (change < -2.0) {
                dir = TrendDirection.DECLINING;
                desc = "Grammar accuracy declined by " + change + "% over recent checks.";
            } else {
                dir = TrendDirection.STABLE;
                desc = "Grammar performance remains consistent within +/-2%.";
            }

            grammarTrend = GrammarAnalyticsDto.GrammarTrendDto.builder()
                    .trendDirection(dir)
                    .recentAverage(roundOneDecimal(recentAvg))
                    .previousAverage(roundOneDecimal(prevAvg))
                    .change(change)
                    .description(desc)
                    .build();
        }

        List<GrammarAnalyticsDto.RecentGrammarCheckDto> recentGrammarList = grammarList.stream()
                .limit(10)
                .map(g -> GrammarAnalyticsDto.RecentGrammarCheckDto.builder()
                        .id(g.getId())
                        .date(g.getCreatedAt())
                        .originalText(g.getOriginalText())
                        .correctedText(g.getCorrectedText())
                        .explanation(g.getExplanation())
                        .grammarScore(g.getGrammarScore())
                        .build())
                .collect(Collectors.toList());

        GrammarAnalyticsDto grammarAnalytics = GrammarAnalyticsDto.builder()
                .totalChecks(totalGrammarChecks)
                .averageGrammarScore(avgGrammarScore)
                .averageScore(avgGrammarScore)
                .grammarTrend(grammarTrend)
                .recentGrammarChecks(recentGrammarList)
                .recentChecks(recentGrammarList)
                .build();

        // 6. Vocabulary Analytics (Bug Fixed: strictly uses v.getMastered())
        List<Vocabulary> vocabList = Collections.emptyList();
        if (vocabularyRepository != null) {
            vocabList = vocabularyRepository.findByUser(user);
            if (vocabList == null) vocabList = Collections.emptyList();
        }

        int totalVocabWords = vocabList.size();
        int masteredVocabWords = (int) vocabList.stream()
                .filter(v -> Boolean.TRUE.equals(v.getMastered()))
                .count();
        int learningVocabWords = totalVocabWords - masteredVocabWords;
        double vocabMasteryPercentage = totalVocabWords > 0 ? ((double) masteredVocabWords / totalVocabWords) * 100.0 : 0.0;

        List<VocabularyAnalyticsDto.RecentVocabularyDto> recentVocabList = vocabList.stream()
                .sorted(Comparator.comparing(Vocabulary::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(10)
                .map(v -> VocabularyAnalyticsDto.RecentVocabularyDto.builder()
                        .id(v.getId())
                        .word(v.getWord())
                        .meaning(v.getMeaning())
                        .partOfSpeech(v.getPartOfSpeech())
                        .level(v.getLevel())
                        .mastered(v.getMastered())
                        .favorite(v.getFavorite())
                        .createdAt(v.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        VocabularyAnalyticsDto vocabularyAnalytics = VocabularyAnalyticsDto.builder()
                .totalWords(totalVocabWords)
                .masteredWords(masteredVocabWords)
                .learningWords(learningVocabWords)
                .masteryPercentage(roundOneDecimal(vocabMasteryPercentage))
                .recentVocabulary(recentVocabList)
                .build();

        // 7. Engagement & Activity Status
        LocalDateTime now = LocalDateTime.now();
        List<LocalDateTime> allActivityTimestamps = new ArrayList<>();

        speakingSessions.forEach(s -> {
            if (s.getCreatedAt() != null) allActivityTimestamps.add(s.getCreatedAt());
        });
        grammarList.forEach(g -> {
            if (g.getCreatedAt() != null) allActivityTimestamps.add(g.getCreatedAt());
        });
        vocabList.forEach(v -> {
            if (v.getCreatedAt() != null) allActivityTimestamps.add(v.getCreatedAt());
        });
        lessonProgressList.forEach(lp -> {
            if (lp.getCompletedAt() != null) allActivityTimestamps.add(lp.getCompletedAt());
            else if (lp.getLastOpenedAt() != null) allActivityTimestamps.add(lp.getLastOpenedAt());
            else if (lp.getUpdatedAt() != null) allActivityTimestamps.add(lp.getUpdatedAt());
        });

        LocalDateTime latestActivityDate = allActivityTimestamps.stream()
                .max(LocalDateTime::compareTo)
                .orElse(null);

        ActivityStatus activityStatus;
        String activityStatusDesc;
        if (latestActivityDate == null) {
            activityStatus = ActivityStatus.NO_ACTIVITY;
            activityStatusDesc = "No learning actions recorded yet.";
        } else {
            long daysSinceActive = ChronoUnit.DAYS.between(latestActivityDate.toLocalDate(), now.toLocalDate());
            if (daysSinceActive <= 7) {
                activityStatus = ActivityStatus.ACTIVE;
                activityStatusDesc = "Active within the past 7 days.";
            } else if (daysSinceActive <= 30) {
                activityStatus = ActivityStatus.RECENTLY_ACTIVE;
                activityStatusDesc = "Active in the past 30 days, but no practice in the past week.";
            } else {
                activityStatus = ActivityStatus.INACTIVE;
                activityStatusDesc = "Inactive for more than 30 days.";
            }
        }

        LocalDate today = now.toLocalDate();
        LocalDate sevenDaysAgo = today.minusDays(7);
        LocalDate thirtyDaysAgo = today.minusDays(30);

        Set<LocalDate> activeDaysLast7 = allActivityTimestamps.stream()
                .map(LocalDateTime::toLocalDate)
                .filter(d -> !d.isBefore(sevenDaysAgo) && !d.isAfter(today))
                .collect(Collectors.toSet());

        Set<LocalDate> activeDaysLast30 = allActivityTimestamps.stream()
                .map(LocalDateTime::toLocalDate)
                .filter(d -> !d.isBefore(thirtyDaysAgo) && !d.isAfter(today))
                .collect(Collectors.toSet());

        int speakingSessionsLast7 = (int) speakingSessions.stream()
                .filter(s -> s.getCreatedAt() != null && !s.getCreatedAt().toLocalDate().isBefore(sevenDaysAgo))
                .count();

        int speakingSessionsLast30 = (int) speakingSessions.stream()
                .filter(s -> s.getCreatedAt() != null && !s.getCreatedAt().toLocalDate().isBefore(thirtyDaysAgo))
                .count();

        int totalPracticeMinutes = totalSpeakingMinutes + totalLessonTimeMinutes;
        if (progress != null && progress.getTotalPracticeMinutes() != null && progress.getTotalPracticeMinutes() > totalPracticeMinutes) {
            totalPracticeMinutes = progress.getTotalPracticeMinutes();
        }

        EngagementDto engagement = EngagementDto.builder()
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalPracticeMinutes(totalPracticeMinutes)
                .speakingMinutes(totalSpeakingMinutes)
                .lessonStudyMinutes(totalLessonTimeMinutes)
                .recentActivityDate(latestActivityDate)
                .activityDaysLast7Days(activeDaysLast7.size())
                .activityDaysLast30Days(activeDaysLast30.size())
                .speakingSessionsLast7Days(speakingSessionsLast7)
                .speakingSessionsLast30Days(speakingSessionsLast30)
                .activityStatus(activityStatus)
                .activityStatusDescription(activityStatusDesc)
                .build();

        // 8. Core Summary KPIs DTO
        CoreSummaryKpiDto summary = CoreSummaryKpiDto.builder()
                .totalXP(totalXp)
                .currentLevel(currentLevel)
                .currentStreak(currentStreak)
                .longestStreak(longestStreak)
                .totalSpeakingSessions(totalSpeakingSessions)
                .completedSpeakingSessions(completedSpeakingSessions)
                .totalSpeakingMinutes(totalSpeakingMinutes)
                .totalGrammarChecks(totalGrammarChecks)
                .totalVocabularyWords(totalVocabWords)
                .masteredVocabularyWords(masteredVocabWords)
                .totalActiveLessons(totalActiveLessons)
                .completedLessons(completedLessons)
                .inProgressLessons(inProgressLessons)
                .build();

        // 9. Learning Phase Engine
        LearningPhaseDto learningPhase = calculateLearningPhase(
                totalXp, currentStreak, totalPracticeMinutes,
                completedLessons, totalSpeakingSessions, totalSpeakingMinutes,
                totalGrammarChecks, totalVocabWords, masteredVocabWords,
                avgOverallScore, avgGrammarScore);

        // 10. Strengths and Areas Needing Attention
        List<StudentStrengthDto> strengths = generateStrengths(
                speakingTrend, avgOverallScore, totalSpeakingSessions,
                avgGrammarScore, totalGrammarChecks,
                vocabMasteryPercentage, masteredVocabWords, totalVocabWords,
                currentStreak, lessonCompletionPercentage, completedLessons);

        List<StudentAttentionAreaDto> areasNeedingAttention = generateAreasNeedingAttention(
                activityStatus, speakingTrend, avgOverallScore, totalSpeakingSessions,
                avgGrammarScore, totalGrammarChecks,
                vocabMasteryPercentage, masteredVocabWords, totalVocabWords,
                lessonCompletionPercentage, completedLessons, totalActiveLessons, totalXp);

        // 11. School Assessments (Safely division-by-zero guarded)
        boolean isSchoolStudent = studentEntity != null || user.getSchoolId() != null;
        SchoolAssessmentsDto assessments = buildSchoolAssessments(user, isSchoolStudent);

        // 12. Recent Activity Timeline (Bounded, merged, descending)
        List<StudentActivityItemDto> recentActivity = buildRecentActivities(
                lessonProgressList, speakingSessions, grammarList, vocabList);

        // 13. Time-Series Data (Lightweight trend points, no fabricated XP)
        TimeSeriesAnalyticsDto timeSeries = buildTimeSeries(
                speakingSessions, grammarList, vocabList, lessonProgressList);

        return StudentProgressProfileResponse.builder()
                .student(studentSummary)
                .summary(summary)
                .learningPhase(learningPhase)
                .engagement(engagement)
                .lessons(lessonAnalytics)
                .speaking(speakingAnalytics)
                .grammar(grammarAnalytics)
                .vocabulary(vocabularyAnalytics)
                .assessments(assessments)
                .strengths(strengths)
                .areasNeedingAttention(areasNeedingAttention)
                .recentActivity(recentActivity)
                .timeSeries(timeSeries)
                .build();
    }

    @Override
    public List<LessonDetailProgressDto> getStudentLessonsDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Lesson> activeLessons = lessonRepository.findByActiveTrue();
        if (activeLessons == null) activeLessons = Collections.emptyList();

        List<LessonProgress> userProgress = lessonProgressRepository.findByUser(user);
        Map<Long, LessonProgress> progressMap = (userProgress != null)
                ? userProgress.stream()
                    .filter(lp -> lp.getLesson() != null)
                    .collect(Collectors.toMap(lp -> lp.getLesson().getId(), lp -> lp, (a, b) -> a))
                : Collections.emptyMap();

        return activeLessons.stream()
                .sorted(Comparator.comparing(Lesson::getOrderIndex, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(lesson -> {
                    LessonProgress lp = progressMap.get(lesson.getId());
                    String status;
                    Integer pct = 0;
                    Integer timeSpent = 0;
                    LocalDateTime lastOpened = null;
                    LocalDateTime completedAt = null;
                    Integer xpEarned = 0;

                    if (lp != null) {
                        pct = lp.getProgressPercent() != null ? lp.getProgressPercent() : 0;
                        timeSpent = lp.getTimeSpentMinutes() != null ? lp.getTimeSpentMinutes() : 0;
                        lastOpened = lp.getLastOpenedAt();
                        completedAt = lp.getCompletedAt();
                        xpEarned = lp.getXpEarned() != null ? lp.getXpEarned() : 0;

                        if (Boolean.TRUE.equals(lp.getCompleted()) || pct == 100) {
                            status = "COMPLETED";
                        } else if (pct > 0) {
                            status = "IN_PROGRESS";
                        } else {
                            status = "NOT_STARTED";
                        }
                    } else {
                        status = "NOT_STARTED";
                    }

                    return LessonDetailProgressDto.builder()
                            .lessonId(lesson.getId())
                            .title(lesson.getTitle())
                            .category(lesson.getCategory())
                            .level(lesson.getLevel())
                            .status(status)
                            .progressPercent(pct)
                            .timeSpentMinutes(timeSpent)
                            .lastOpenedAt(lastOpened)
                            .completedAt(completedAt)
                            .xpReward(lesson.getXpReward() != null ? lesson.getXpReward() : 35)
                            .xpEarned(xpEarned)
                            .estimatedMinutes(lesson.getEstimatedMinutes() != null ? lesson.getEstimatedMinutes() : lesson.getDuration())
                            .orderIndex(lesson.getOrderIndex())
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ── Internal Deterministic Helper Engines ─────────────────────────────

    private LearningPhaseDto calculateLearningPhase(
            int xp, int streak, int totalPracticeMins,
            int completedLessons, int totalSpeaking, int speakingMins,
            int totalGrammar, int totalVocab, int masteredVocab,
            Double avgSpeaking, Double avgGrammar) {

        int totalActions = completedLessons + totalSpeaking + totalGrammar + totalVocab;

        if (totalActions == 0) {
            return LearningPhaseDto.builder()
                    .phase(LearningPhase.GETTING_STARTED)
                    .displayName(LearningPhase.GETTING_STARTED.getDisplayName())
                    .shortDescription(LearningPhase.GETTING_STARTED.getDescription())
                    .reason("The learner account is newly enrolled with no recorded practice activities.")
                    .confidence(1.0)
                    .build();
        }

        // Check Phase 6: Independent Practice
        if (completedLessons >= 15 && totalSpeaking >= 15 && masteredVocab >= 25
                && avgSpeaking != null && avgSpeaking >= 80.0
                && avgGrammar != null && avgGrammar >= 80.0) {
            return LearningPhaseDto.builder()
                    .phase(LearningPhase.INDEPENDENT_PRACTICE)
                    .displayName(LearningPhase.INDEPENDENT_PRACTICE.getDisplayName())
                    .shortDescription(LearningPhase.INDEPENDENT_PRACTICE.getDescription())
                    .reason("Self-directed learning across all core modules with >=80% accuracy in speaking and grammar.")
                    .confidence(0.95)
                    .build();
        }

        // Check Phase 5: Building Fluency
        if (totalSpeaking >= 10 && speakingMins >= 45 && totalVocab >= 20
                && avgSpeaking != null && avgSpeaking >= 72.0) {
            return LearningPhaseDto.builder()
                    .phase(LearningPhase.BUILDING_FLUENCY)
                    .displayName(LearningPhase.BUILDING_FLUENCY.getDisplayName())
                    .shortDescription(LearningPhase.BUILDING_FLUENCY.getDescription())
                    .reason("Sustained conversational practice volume with strong speaking scores (>=72%) and expanding vocabulary.")
                    .confidence(0.90)
                    .build();
        }

        // Check Phase 4: Developing Proficiency
        if (completedLessons >= 5 && (totalSpeaking >= 4 || totalGrammar >= 10)
                && ((avgSpeaking != null && avgSpeaking >= 65.0) || (avgGrammar != null && avgGrammar >= 70.0))) {
            return LearningPhaseDto.builder()
                    .phase(LearningPhase.DEVELOPING_PROFICIENCY)
                    .displayName(LearningPhase.DEVELOPING_PROFICIENCY.getDisplayName())
                    .shortDescription(LearningPhase.DEVELOPING_PROFICIENCY.getDescription())
                    .reason("Steady progress through syllabus lessons with solid accuracy in grammar and speaking checks.")
                    .confidence(0.85)
                    .build();
        }

        // Check Phase 3: Active Learner
        if ((totalSpeaking >= 3 || completedLessons >= 3 || totalGrammar >= 8) && xp >= 300) {
            return LearningPhaseDto.builder()
                    .phase(LearningPhase.ACTIVE_LEARNER)
                    .displayName(LearningPhase.ACTIVE_LEARNER.getDisplayName())
                    .shortDescription(LearningPhase.ACTIVE_LEARNER.getDescription())
                    .reason("Regular engagement across multiple pillars with steady accumulation of experience points.")
                    .confidence(0.85)
                    .build();
        }

        // Check Phase 2: Building the Habit
        if (streak >= 2 || totalPracticeMins >= 15 || totalSpeaking >= 1 || totalGrammar >= 3 || completedLessons >= 1) {
            return LearningPhaseDto.builder()
                    .phase(LearningPhase.BUILDING_THE_HABIT)
                    .displayName(LearningPhase.BUILDING_THE_HABIT.getDisplayName())
                    .shortDescription(LearningPhase.BUILDING_THE_HABIT.getDescription())
                    .reason("Establishing an initial learning routine and completing first milestone exercises.")
                    .confidence(0.80)
                    .build();
        }

        return LearningPhaseDto.builder()
                .phase(LearningPhase.GETTING_STARTED)
                .displayName(LearningPhase.GETTING_STARTED.getDisplayName())
                .shortDescription(LearningPhase.GETTING_STARTED.getDescription())
                .reason("Early stage of exploration with foundational exercises and initial orientation.")
                .confidence(0.90)
                .build();
    }

    private List<StudentStrengthDto> generateStrengths(
            SpeakingAnalyticsDto.SpeakingTrendDto speakingTrend, Double avgSpeaking, int totalSpeaking,
            Double avgGrammar, int totalGrammar,
            double vocabMasteryPct, int masteredVocab, int totalVocab,
            int streak, double lessonCompletionPct, int completedLessons) {

        List<StudentStrengthDto> strengths = new ArrayList<>();

        if (speakingTrend != null && speakingTrend.getTrendDirection() == TrendDirection.IMPROVING && speakingTrend.getChange() != null) {
            strengths.add(StudentStrengthDto.builder()
                    .area("Speaking Improvement")
                    .scoreOrValue("+" + speakingTrend.getChange() + "%")
                    .reason("Speaking evaluations show a solid upward trend across recent sessions.")
                    .build());
        }

        if (avgSpeaking != null && avgSpeaking >= 75.0 && totalSpeaking >= 3) {
            strengths.add(StudentStrengthDto.builder()
                    .area("Speaking Proficiency")
                    .scoreOrValue(Math.round(avgSpeaking) + "% Average")
                    .reason("High conversational accuracy and fluency sustained over " + totalSpeaking + " practice sessions.")
                    .build());
        }

        if (avgGrammar != null && avgGrammar >= 80.0 && totalGrammar >= 5) {
            strengths.add(StudentStrengthDto.builder()
                    .area("Grammar Precision")
                    .scoreOrValue(Math.round(avgGrammar) + "% Accuracy")
                    .reason("Strong syntax command demonstrated across " + totalGrammar + " Grammar Doctor checks.")
                    .build());
        }

        if (totalVocab >= 10 && vocabMasteryPct >= 50.0) {
            strengths.add(StudentStrengthDto.builder()
                    .area("Vocabulary Mastery")
                    .scoreOrValue(Math.round(vocabMasteryPct) + "% Mastered")
                    .reason("Committed " + masteredVocab + " out of " + totalVocab + " logged words to full mastery.")
                    .build());
        }

        if (streak >= 3) {
            strengths.add(StudentStrengthDto.builder()
                    .area("Consistent Habit")
                    .scoreOrValue(streak + "-Day Streak")
                    .reason("Maintains active daily engagement, fostering consistent skill progression.")
                    .build());
        }

        if (lessonCompletionPct >= 35.0 && completedLessons >= 3) {
            strengths.add(StudentStrengthDto.builder()
                    .area("Curriculum Dedication")
                    .scoreOrValue(completedLessons + " Lessons Done")
                    .reason("Completed " + Math.round(lessonCompletionPct) + "% of the active lesson catalogue.")
                    .build());
        }

        return strengths;
    }

    private List<StudentAttentionAreaDto> generateAreasNeedingAttention(
            ActivityStatus activityStatus, SpeakingAnalyticsDto.SpeakingTrendDto speakingTrend,
            Double avgSpeaking, int totalSpeaking,
            Double avgGrammar, int totalGrammar,
            double vocabMasteryPct, int masteredVocab, int totalVocab,
            double lessonCompletionPct, int completedLessons, int totalActiveLessons, int xp) {

        List<StudentAttentionAreaDto> attentionAreas = new ArrayList<>();

        if (activityStatus == ActivityStatus.INACTIVE) {
            attentionAreas.add(StudentAttentionAreaDto.builder()
                    .area("Inactivity Risk")
                    .scoreOrValue("Over 30 Days")
                    .reason("Student has not completed any learning actions in over a month. Re-engagement recommended.")
                    .build());
        }

        if (speakingTrend != null && speakingTrend.getTrendDirection() == TrendDirection.DECLINING && speakingTrend.getChange() != null) {
            attentionAreas.add(StudentAttentionAreaDto.builder()
                    .area("Declining Speaking Scores")
                    .scoreOrValue(speakingTrend.getChange() + "%")
                    .reason("Recent speaking session scores have dropped compared to earlier performances.")
                    .build());
        }

        if (avgSpeaking != null && avgSpeaking < 60.0 && totalSpeaking >= 2) {
            attentionAreas.add(StudentAttentionAreaDto.builder()
                    .area("Speaking Fluency & Scoring")
                    .scoreOrValue(Math.round(avgSpeaking) + "% Average")
                    .reason("Speaking performance is below expected threshold; recommend guided practice scenarios.")
                    .build());
        }

        if (avgGrammar != null && avgGrammar < 65.0 && totalGrammar >= 3) {
            attentionAreas.add(StudentAttentionAreaDto.builder()
                    .area("Grammar Syntax & Tenses")
                    .scoreOrValue(Math.round(avgGrammar) + "% Accuracy")
                    .reason("Frequent syntax mistakes identified during Grammar Doctor checks.")
                    .build());
        }

        if (totalVocab >= 10 && vocabMasteryPct < 25.0) {
            attentionAreas.add(StudentAttentionAreaDto.builder()
                    .area("Vocabulary Retention")
                    .scoreOrValue(masteredVocab + "/" + totalVocab + " Mastered")
                    .reason("Only " + Math.round(vocabMasteryPct) + "% of saved vocabulary is mastered. Flashcard reviews needed.")
                    .build());
        }

        if (totalActiveLessons > 0 && lessonCompletionPct < 15.0 && xp >= 250) {
            attentionAreas.add(StudentAttentionAreaDto.builder()
                    .area("Curriculum Progression")
                    .scoreOrValue(completedLessons + " Lessons")
                    .reason("Low syllabus lesson completion relative to overall activity volume.")
                    .build());
        }

        return attentionAreas;
    }

    private SchoolAssessmentsDto buildSchoolAssessments(User user, boolean isSchoolStudent) {
        if (!isSchoolStudent) {
            return SchoolAssessmentsDto.builder()
                    .isSchoolStudent(false)
                    .totalTests(0)
                    .completedTests(0)
                    .averageTestPercentage(null)
                    .recentResults(Collections.emptyList())
                    .assignmentsSummary(null)
                    .build();
        }

        List<Result> results = Collections.emptyList();
        if (resultRepository != null) {
            results = resultRepository.findByStudent(user);
            if (results == null) results = Collections.emptyList();
        }

        int totalTests = results.size();
        int completedTests = (int) results.stream()
                .filter(r -> r.getMarksObtained() != null && r.getTotalMarks() != null && r.getTotalMarks() > 0)
                .count();

        Double avgPercentage = null;
        List<Double> validPercentages = results.stream()
                .filter(r -> r.getMarksObtained() != null && r.getTotalMarks() != null && r.getTotalMarks() > 0)
                .map(r -> (r.getMarksObtained() / r.getTotalMarks()) * 100.0)
                .toList();

        if (!validPercentages.isEmpty()) {
            avgPercentage = roundOneDecimal(validPercentages.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
        }

        List<SchoolAssessmentsDto.AssessmentResultDto> recentResultDtos = results.stream()
                .sorted(Comparator.comparing(Result::getSubmittedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(10)
                .map(r -> {
                    Double pct = (r.getMarksObtained() != null && r.getTotalMarks() != null && r.getTotalMarks() > 0)
                            ? roundOneDecimal((r.getMarksObtained() / r.getTotalMarks()) * 100.0)
                            : null;

                    return SchoolAssessmentsDto.AssessmentResultDto.builder()
                            .id(r.getId())
                            .testTitle(r.getTestTitle())
                            .marksObtained(r.getMarksObtained())
                            .totalMarks(r.getTotalMarks())
                            .percentage(pct)
                            .status(r.getStatus())
                            .submittedAt(r.getSubmittedAt() != null ? r.getSubmittedAt() : r.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());

        SchoolAssessmentsDto.AssignmentSummaryDto assignmentSummary = null;
        if (assignmentProgressRepository != null) {
            try {
                List<AssignmentProgress> studentAssignments = assignmentProgressRepository.findByStudentId(user.getId());
                if (studentAssignments != null && !studentAssignments.isEmpty()) {
                    int totalAssigned = studentAssignments.size();
                    int inProgress = (int) studentAssignments.stream().filter(a -> "IN_PROGRESS".equalsIgnoreCase(a.getStatus())).count();
                    int completed = (int) studentAssignments.stream().filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus())).count();
                    int overdue = (int) studentAssignments.stream().filter(a -> "OVERDUE".equalsIgnoreCase(a.getStatus())).count();
                    double avgScore = studentAssignments.stream()
                            .filter(a -> a.getScore() != null)
                            .mapToInt(AssignmentProgress::getScore)
                            .average().orElse(0.0);

                    assignmentSummary = SchoolAssessmentsDto.AssignmentSummaryDto.builder()
                            .totalAssigned(totalAssigned)
                            .inProgress(inProgress)
                            .completed(completed)
                            .overdue(overdue)
                            .averageScore(roundOneDecimal(avgScore))
                            .build();
                }
            } catch (Exception ignored) {}
        }

        return SchoolAssessmentsDto.builder()
                .isSchoolStudent(true)
                .totalTests(totalTests)
                .completedTests(completedTests)
                .averageTestPercentage(avgPercentage)
                .recentResults(recentResultDtos)
                .assignmentsSummary(assignmentSummary)
                .build();
    }

    private List<StudentActivityItemDto> buildRecentActivities(
            List<LessonProgress> lessonList,
            List<SpeakingSession> speakingList,
            List<GrammarHistory> grammarList,
            List<Vocabulary> vocabList) {

        List<StudentActivityItemDto> activities = new ArrayList<>();

        if (lessonList != null) {
            for (LessonProgress lp : lessonList) {
                LocalDateTime date = lp.getCompletedAt() != null ? lp.getCompletedAt() : (lp.getLastOpenedAt() != null ? lp.getLastOpenedAt() : lp.getUpdatedAt());
                activities.add(StudentActivityItemDto.builder()
                        .activityType("LESSON")
                        .relatedId(lp.getLesson() != null ? lp.getLesson().getId() : null)
                        .title(lp.getLesson() != null ? lp.getLesson().getTitle() : "Lesson Practice")
                        .description("Progress: " + (lp.getProgressPercent() != null ? lp.getProgressPercent() : 0) + "%")
                        .scoreOrValue((lp.getProgressPercent() != null ? lp.getProgressPercent() : 0) + "%")
                        .xpEarned(lp.getXpEarned())
                        .timestamp(date)
                        .status(Boolean.TRUE.equals(lp.getCompleted()) || (lp.getProgressPercent() != null && lp.getProgressPercent() == 100) ? "COMPLETED" : "IN_PROGRESS")
                        .build());
            }
        }

        if (speakingList != null) {
            for (SpeakingSession s : speakingList) {
                Double score = s.getOverallScore() != null ? s.getOverallScore() : s.getScore();
                activities.add(StudentActivityItemDto.builder()
                        .activityType("SPEAKING")
                        .relatedId(s.getId())
                        .title(s.getScenario() != null ? s.getScenario() : (s.getTopic() != null ? s.getTopic() : "Speaking Session"))
                        .description("Speaking Practice (" + (s.getDuration() != null ? (s.getDuration() / 60) + "m" : "0m") + ")")
                        .scoreOrValue(score != null ? Math.round(score) + "%" : "Completed")
                        .xpEarned(s.getXpEarned())
                        .timestamp(s.getCreatedAt())
                        .status(Boolean.TRUE.equals(s.getCompleted()) ? "COMPLETED" : "ATTEMPTED")
                        .build());
            }
        }

        if (grammarList != null) {
            for (GrammarHistory g : grammarList) {
                activities.add(StudentActivityItemDto.builder()
                        .activityType("GRAMMAR")
                        .relatedId(g.getId())
                        .title(g.getOriginalText() != null && !g.getOriginalText().isBlank() ? g.getOriginalText() : "Grammar Doctor Check")
                        .description(g.getExplanation() != null && !g.getExplanation().isBlank() ? g.getExplanation() : "Grammar Accuracy Evaluated")
                        .scoreOrValue(g.getGrammarScore() != null ? Math.round(g.getGrammarScore()) + "%" : null)
                        .xpEarned(8)
                        .timestamp(g.getCreatedAt())
                        .status(g.getGrammarScore() != null && g.getGrammarScore() >= 80.0 ? "EXCELLENT" : "COMPLETED")
                        .build());
            }
        }

        if (vocabList != null) {
            for (Vocabulary v : vocabList) {
                activities.add(StudentActivityItemDto.builder()
                        .activityType("VOCABULARY")
                        .relatedId(v.getId())
                        .title(v.getWord())
                        .description(v.getMeaning() != null ? v.getMeaning() : "Added to vocabulary bank")
                        .scoreOrValue(Boolean.TRUE.equals(v.getMastered()) ? "Mastered" : "Learning")
                        .xpEarned(Boolean.TRUE.equals(v.getMastered()) ? 10 : 5)
                        .timestamp(v.getCreatedAt())
                        .status(Boolean.TRUE.equals(v.getMastered()) ? "MASTERED" : "LEARNED")
                        .build());
            }
        }

        activities.sort(Comparator.comparing(StudentActivityItemDto::getTimestamp, Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        return activities.stream().limit(20).collect(Collectors.toList());
    }

    private TimeSeriesAnalyticsDto buildTimeSeries(
            List<SpeakingSession> speakingList,
            List<GrammarHistory> grammarList,
            List<Vocabulary> vocabList,
            List<LessonProgress> lessonList) {

        List<TimeSeriesAnalyticsDto.SpeakingPoint> speakingPoints = Collections.emptyList();
        if (speakingList != null) {
            speakingPoints = speakingList.stream()
                    .filter(s -> s.getCreatedAt() != null && isEvaluatedSpeakingSession(s))
                    .sorted(Comparator.comparing(SpeakingSession::getCreatedAt))
                    .map(s -> TimeSeriesAnalyticsDto.SpeakingPoint.builder()
                            .date(s.getCreatedAt())
                            .overallScore(getEvaluatedSpeakingScore(s))
                            .fluencyScore(s.getFluencyScore())
                            .pronunciationScore(s.getPronunciationScore())
                            .build())
                    .collect(Collectors.toList());
        }

        List<TimeSeriesAnalyticsDto.GrammarPoint> grammarPoints = Collections.emptyList();
        if (grammarList != null) {
            grammarPoints = grammarList.stream()
                    .filter(g -> g.getCreatedAt() != null && g.getGrammarScore() != null)
                    .sorted(Comparator.comparing(GrammarHistory::getCreatedAt))
                    .map(g -> TimeSeriesAnalyticsDto.GrammarPoint.builder()
                            .date(g.getCreatedAt())
                            .grammarScore(g.getGrammarScore())
                            .build())
                    .collect(Collectors.toList());
        }

        // Vocabulary Growth (Cumulative over time)
        List<TimeSeriesAnalyticsDto.VocabularyGrowthPoint> vocabPoints = new ArrayList<>();
        if (vocabList != null && !vocabList.isEmpty()) {
            List<Vocabulary> sortedVocab = vocabList.stream()
                    .filter(v -> v.getCreatedAt() != null)
                    .sorted(Comparator.comparing(Vocabulary::getCreatedAt))
                    .toList();

            int cumulative = 0;
            int masteredCumulative = 0;
            for (Vocabulary v : sortedVocab) {
                cumulative++;
                if (Boolean.TRUE.equals(v.getMastered())) {
                    masteredCumulative++;
                }
                vocabPoints.add(TimeSeriesAnalyticsDto.VocabularyGrowthPoint.builder()
                        .date(v.getCreatedAt())
                        .cumulativeWords(cumulative)
                        .masteredWords(masteredCumulative)
                        .build());
            }
        }

        // Lessons Progress Growth (Cumulative completed over time)
        List<TimeSeriesAnalyticsDto.LessonProgressPoint> lessonPoints = new ArrayList<>();
        if (lessonList != null && !lessonList.isEmpty()) {
            List<LessonProgress> completedSorted = lessonList.stream()
                    .filter(lp -> (Boolean.TRUE.equals(lp.getCompleted()) || (lp.getProgressPercent() != null && lp.getProgressPercent() == 100))
                            && (lp.getCompletedAt() != null || lp.getUpdatedAt() != null))
                    .sorted(Comparator.comparing(lp -> lp.getCompletedAt() != null ? lp.getCompletedAt() : lp.getUpdatedAt()))
                    .toList();

            int cumLessons = 0;
            for (LessonProgress lp : completedSorted) {
                cumLessons++;
                LocalDateTime d = lp.getCompletedAt() != null ? lp.getCompletedAt() : lp.getUpdatedAt();
                lessonPoints.add(TimeSeriesAnalyticsDto.LessonProgressPoint.builder()
                        .date(d)
                        .cumulativeCompletedLessons(cumLessons)
                        .build());
            }
        }

        return TimeSeriesAnalyticsDto.builder()
                .speakingTrend(speakingPoints)
                .grammarTrend(grammarPoints)
                .vocabularyGrowth(vocabPoints)
                .lessonGrowth(lessonPoints)
                .build();
    }

    private Double averageScore(List<Double> scores) {
        if (scores == null || scores.isEmpty()) return null;
        double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
        return roundOneDecimal(avg);
    }

    private double roundOneDecimal(double val) {
        return Math.round(val * 10.0) / 10.0;
    }

    private boolean isEvaluatedSpeakingSession(SpeakingSession s) {
        if (s == null) return false;
        if (s.getOverallScore() != null && s.getOverallScore() > 0) return true;
        return Boolean.TRUE.equals(s.getCompleted()) && s.getScore() != null && s.getScore() > 0;
    }

    private Double getEvaluatedSpeakingScore(SpeakingSession s) {
        if (s == null) return null;
        if (s.getOverallScore() != null && s.getOverallScore() > 0) return s.getOverallScore();
        if (Boolean.TRUE.equals(s.getCompleted()) && s.getScore() != null && s.getScore() > 0) return s.getScore();
        return null;
    }
}
