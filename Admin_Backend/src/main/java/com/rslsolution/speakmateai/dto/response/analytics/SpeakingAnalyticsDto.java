package com.rslsolution.speakmateai.dto.response.analytics;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeakingAnalyticsDto {
    private Integer totalSessions;
    private Integer completedSessions;
    private Integer totalSpeakingMinutes;
    private Double averageOverallScore;
    private Double averageFluencyScore;
    private Double averagePronunciationScore;
    private Double averageGrammarScore;
    private Double averageVocabularyScore;
    private Double bestScore;
    private SpeakingTrendDto speakingTrend;
    private List<RecentSpeakingSessionDto> recentSessions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpeakingTrendDto {
        private TrendDirection trendDirection;
        private Double recentAverage;
        private Double previousAverage;
        private Double change;
        private String description;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentSpeakingSessionDto {
        private Long sessionId;
        private LocalDateTime date;
        private String scenario;
        private String topic;
        private Integer durationSeconds;
        private Double overallScore;
        private Double fluencyScore;
        private Double pronunciationScore;
        private Double grammarScore;
        private Double vocabularyScore;
        private Integer xpEarned;
        private Boolean completed;
        private String feedbackSummary;
    }
}
