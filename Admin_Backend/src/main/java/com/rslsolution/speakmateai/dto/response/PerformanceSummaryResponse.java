package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceSummaryResponse {
	private Double overallScore;
	private Double grammarScore;
	private Double vocabularyScore;
	private Double speakingScore;
	private Double listeningScore;
	private Integer lessonsCompleted;
	private Integer totalSpeakingSessions;
}
