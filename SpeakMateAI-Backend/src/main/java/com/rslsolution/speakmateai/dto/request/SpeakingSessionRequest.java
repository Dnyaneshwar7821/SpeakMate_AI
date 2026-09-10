package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSessionRequest {

	@NotBlank(message = "Topic is required")
	private String topic;

	private String scenario;

	@NotBlank(message = "Transcript is required")
	private String transcript;

	@NotNull(message = "Duration is required")
	@Min(value = 1, message = "Duration must be greater than 0")
	private Integer duration;

	private Double overallScore;
	private Double score;
	private Double grammarScore;
	private Double vocabularyScore;
	private Double fluencyScore;
	private Double pronunciationScore;
	private Integer xpEarned;
	private Integer dialogueTurns;
	private String feedback;
	private String vocabularyLearned;
	private String grammarCorrections;
	private String betterSentences;
	private String motivationalMessage;
}