package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContinueLearningResponse {

	private String module; // "Speaking Session", "Lesson", "Vocabulary Quiz", "Grammar Exercise", "AI Chat"
	private String title;
	private Integer progressPercent;
	private Integer estimatedMinutesRemaining;
	private Long targetId;

}
