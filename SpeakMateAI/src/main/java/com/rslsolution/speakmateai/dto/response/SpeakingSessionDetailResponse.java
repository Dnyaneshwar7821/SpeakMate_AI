package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSessionDetailResponse {

	private Long id;

	private String scenario;

	private Integer duration;

	private Integer xpEarned;

	private Double score;

	private Double pronunciationScore;

	private Double fluencyScore;

	private Double grammarScore;

	private Double vocabularyScore;

	private Double overallScore;

	private String feedback;

	private LocalDateTime createdAt;

	private List<MessageDto> messages;

	private FeedbackDto feedbackDetail;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MessageDto {
		private Long id;
		private String sender;
		private String message;
		private LocalDateTime timestamp;
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class FeedbackDto {
		private String grammarCorrections;
		private String betterSentences;
		private String vocabularySuggestions;
		private String summary;
	}
}
