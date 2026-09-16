package com.rslsolution.speakmateai.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoreSummaryKpiDto {
    private Integer totalXP;
    private Integer currentLevel;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalSpeakingSessions;
    private Integer completedSpeakingSessions;
    private Integer totalSpeakingMinutes;
    private Integer totalGrammarChecks;
    private Integer totalVocabularyWords;
    private Integer masteredVocabularyWords;
    private Integer totalActiveLessons;
    private Integer completedLessons;
    private Integer inProgressLessons;
}
