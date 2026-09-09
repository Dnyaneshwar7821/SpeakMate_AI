package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse;
import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse.DurationSummary;
import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse.MetricSummary;
import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse.MispronouncedWord;
import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse.Speaker;
import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse.SpeechMetric;
import com.rslsolution.speakmateai.dto.response.SchoolInsightsResponse.TrendPoint;
import com.rslsolution.speakmateai.entity.SpeakingSession;
import com.rslsolution.speakmateai.entity.Student;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.SchoolInsightsService;

@Service
@Transactional(readOnly = true)
public class SchoolInsightsServiceImpl implements SchoolInsightsService {

    private static final Map<String, Integer> RANGE_MONTHS = Map.of("1m", 1, "3m", 3, "6m", 6, "1y", 12);
    private static final Locale REPORT_LOCALE = Locale.ENGLISH;

    private final SpeakingSessionRepository speakingSessionRepository;
    private final UserRepository userRepository;

    public SchoolInsightsServiceImpl(SpeakingSessionRepository speakingSessionRepository, UserRepository userRepository) {
        this.speakingSessionRepository = speakingSessionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public SchoolInsightsResponse getSchoolInsights(String requestedRange) {
        User currentUser = getCurrentUser();
        if (currentUser.getRole() != Role.SCHOOL_ADMIN) {
            throw new RuntimeException("Unauthorized: Only School Admin can access insights");
        }
        Long schoolId = currentUser.getSchoolId();
        if (schoolId == null) {
            throw new RuntimeException("School Admin is not associated with any school");
        }

        String range = RANGE_MONTHS.containsKey(requestedRange) ? requestedRange : "6m";
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMonths(RANGE_MONTHS.get(range));
        List<SpeakingSession> sessions = speakingSessionRepository.findSchoolSessionsBetween(schoolId, start, end);

        return SchoolInsightsResponse.builder()
                .range(range)
                .fluency(metricSummary(sessions, SpeakingSession::getFluencyScore))
                .pronunciation(metricSummary(sessions, SpeakingSession::getPronunciationScore))
                .speakingTime(durationSummary(sessions))
                .speechMetrics(buildSpeechMetrics(sessions))
                .trends(buildTrends(sessions, start, end, RANGE_MONTHS.get(range)))
                .topSpeakers(buildTopSpeakers(sessions))
                .mispronouncedWords(Collections.<MispronouncedWord>emptyList())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UserNotFoundException("Authenticated user not found");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private MetricSummary metricSummary(List<SpeakingSession> sessions, Function<SpeakingSession, Double> scoreFunction) {
        List<Double> scores = validScores(sessions, scoreFunction);
        double average = average(scores);
        return MetricSummary.builder().value(round(average)).change(0.0).sparkline(scores).build();
    }

    private DurationSummary durationSummary(List<SpeakingSession> sessions) {
        long seconds = sessions.stream()
                .map(SpeakingSession::getDuration)
                .filter(value -> value != null && value > 0)
                .mapToLong(Integer::longValue)
                .sum();
        List<Double> sparkline = sessions.stream()
                .map(SpeakingSession::getDuration)
                .filter(value -> value != null && value > 0)
                .map(Integer::doubleValue)
                .collect(Collectors.toList());
        return DurationSummary.builder().seconds(seconds).change(0.0).sparkline(sparkline).build();
    }

    private List<SpeechMetric> buildSpeechMetrics(List<SpeakingSession> sessions) {
        return List.of(
                metric("Fluency", sessions, SpeakingSession::getFluencyScore),
                metric("Pronunciation", sessions, SpeakingSession::getPronunciationScore),
                metric("Vocabulary", sessions, SpeakingSession::getVocabularyScore),
                metric("Grammar", sessions, SpeakingSession::getGrammarScore));
    }

    private SpeechMetric metric(String name, List<SpeakingSession> sessions, Function<SpeakingSession, Double> scoreFunction) {
        return SpeechMetric.builder().metric(name).score(round(average(validScores(sessions, scoreFunction)))).build();
    }

    private List<TrendPoint> buildTrends(List<SpeakingSession> sessions, LocalDateTime start, LocalDateTime end, int months) {
        int bucketCount = months <= 1 ? 4 : months;
        List<TrendPoint> trends = new ArrayList<>();
        for (int index = 0; index < bucketCount; index++) {
            LocalDateTime bucketStart = bucketCount == 4
                    ? start.plusDays((long) index * Math.max(1, ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate()) / 4))
                    : start.plusMonths(index);
            LocalDateTime bucketEnd = index == bucketCount - 1
                    ? end
                    : (bucketCount == 4 ? start.plusDays((long) (index + 1) * Math.max(1, ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate()) / 4)) : start.plusMonths(index + 1));
            List<SpeakingSession> bucket = sessions.stream()
                    .filter(session -> session.getCreatedAt() != null
                            && !session.getCreatedAt().isBefore(bucketStart)
                            && session.getCreatedAt().isBefore(bucketEnd))
                    .collect(Collectors.toList());
            String label = bucketCount == 4 ? "W" + (index + 1)
                    : bucketStart.getMonth().getDisplayName(TextStyle.SHORT, REPORT_LOCALE);
            trends.add(TrendPoint.builder()
                    .label(label)
                    .fluency(round(averageScores(bucket, SpeakingSession::getFluencyScore)))
                    .pronunciation(round(averageScores(bucket, SpeakingSession::getPronunciationScore)))
                    .build());
        }
        return trends;
    }

    private List<Speaker> buildTopSpeakers(List<SpeakingSession> sessions) {
        Map<Long, List<SpeakingSession>> byUser = sessions.stream()
                .filter(session -> session.getUser() != null && session.getUser().getId() != null)
                .collect(Collectors.groupingBy(session -> session.getUser().getId()));
        return byUser.values().stream()
                .map(userSessions -> {
                    com.rslsolution.speakmateai.entity.User user = userSessions.get(0).getUser();
                    return Speaker.builder()
                            .id(user.getId())
                            .name((user.getFirstName() + " " + user.getLastName()).trim())
                            .standard(user.getStandard())
                            .score(round(averageScores(userSessions, SpeakingSession::getPronunciationScore)))
                            .build();
                })
                .filter(speaker -> speaker.getScore() > 0)
                .sorted(Comparator.comparing(Speaker::getScore).reversed())
                .limit(5)
                .collect(Collectors.toList());
    }

    private double averageScores(List<SpeakingSession> sessions, Function<SpeakingSession, Double> scoreFunction) {
        return average(validScores(sessions, scoreFunction));
    }

    private List<Double> validScores(List<SpeakingSession> sessions, Function<SpeakingSession, Double> scoreFunction) {
        return sessions.stream()
                .map(scoreFunction)
                .filter(Objects::nonNull)
                .filter(Double::isFinite)
                .collect(Collectors.toList());
    }

    private double average(List<Double> values) {
        return values.stream().mapToDouble(Double::doubleValue).average().orElse(0.0);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
