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
public class VocabularyAnalyticsDto {
    private Integer totalWords;
    private Integer masteredWords;
    private Integer learningWords;
    private Double masteryPercentage;
    private List<RecentVocabularyDto> recentVocabulary;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentVocabularyDto {
        private Long id;
        private String word;
        private String meaning;
        private String partOfSpeech;
        private String level;
        private Boolean mastered;
        private Boolean favorite;
        private LocalDateTime createdAt;
    }
}
