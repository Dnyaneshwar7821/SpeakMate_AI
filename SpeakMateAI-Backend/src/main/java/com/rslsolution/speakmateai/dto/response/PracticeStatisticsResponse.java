package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeStatisticsResponse {
	private Integer totalSpeakingSessions;
	private Integer totalPracticeMinutes;
	private Integer totalGrammarChecks;
	private Integer totalVocabularyWords;
	private Integer totalLessonsCompleted;
	private Double averageSessionScore;
}
