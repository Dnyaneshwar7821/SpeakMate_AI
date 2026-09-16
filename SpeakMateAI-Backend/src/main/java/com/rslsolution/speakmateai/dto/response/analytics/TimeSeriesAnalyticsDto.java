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
public class TimeSeriesAnalyticsDto {
    private List<SpeakingPoint> speakingTrend;
    private List<GrammarPoint> grammarTrend;
    private List<VocabularyGrowthPoint> vocabularyGrowth;
    private List<LessonProgressPoint> lessonGrowth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpeakingPoint {
        private LocalDateTime date;
        private Double overallScore;
        private Double fluencyScore;
        private Double pronunciationScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrammarPoint {
        private LocalDateTime date;
        private Double grammarScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VocabularyGrowthPoint {
        private LocalDateTime date;
        private Integer cumulativeWords;
        private Integer masteredWords;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LessonProgressPoint {
        private LocalDateTime date;
        private Integer cumulativeCompletedLessons;
    }
}
