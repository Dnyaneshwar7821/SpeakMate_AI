package com.rslsolution.speakmateai.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolInsightsResponse {

    private String range;
    private MetricSummary fluency;
    private MetricSummary pronunciation;
    private DurationSummary speakingTime;
    private List<SpeechMetric> speechMetrics;
    private List<TrendPoint> trends;
    private List<Speaker> topSpeakers;
    private List<MispronouncedWord> mispronouncedWords;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricSummary {
        private Double value;
        private Double change;
        private List<Double> sparkline;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DurationSummary {
        private Long seconds;
        private Double change;
        private List<Double> sparkline;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SpeechMetric {
        private String metric;
        private Double score;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendPoint {
        private String label;
        private Double fluency;
        private Double pronunciation;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Speaker {
        private Long id;
        private String name;
        private String standard;
        private Double score;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MispronouncedWord {
        private String word;
        private Long count;
        private String difficulty;
    }
}
