package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PronunciationResponse {

	private String feedback;

	public String getFeedback() { return feedback; }
	public void setFeedback(String feedback) { this.feedback = feedback; }

	public static PronunciationResponseBuilder builder() {
		return new PronunciationResponseBuilder();
	}

	public static class PronunciationResponseBuilder {
		private String feedback;

		public PronunciationResponseBuilder feedback(String feedback) { this.feedback = feedback; return this; }

		public PronunciationResponse build() {
			return new PronunciationResponse(feedback);
		}
	}
}