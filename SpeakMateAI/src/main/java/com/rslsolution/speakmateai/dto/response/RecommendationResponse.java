package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {

	private String type; // "lesson", "speaking", "vocabulary", "grammar", "chat"
	private String title;
	private String actionLabel; // "Resume", "Practice", "Review", "Check"
	private Long targetId;

}
