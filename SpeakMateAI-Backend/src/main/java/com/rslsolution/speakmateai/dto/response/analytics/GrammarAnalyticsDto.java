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
public class GrammarAnalyticsDto {
    private Integer totalChecks;
    private Double averageGrammarScore;
    private GrammarTrendDto grammarTrend;
    private List<RecentGrammarCheckDto> recentGrammarChecks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GrammarTrendDto {
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
    public static class RecentGrammarCheckDto {
        private Long id;
        private LocalDateTime date;
        private String originalText;
        private String correctedText;
        private String explanation;
        private Double grammarScore;
    }
}
