package com.rslsolution.speakmateai.dto.request;

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
public class SpeakingMessageRequest {

	@NotNull(message = "Session ID is required")
	private Long sessionId;

	@NotBlank(message = "Message is required")
	private String message;

	private String level;

	public Long getSessionId() { return sessionId; }
	public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public String getLevel() { return level; }
	public void setLevel(String level) { this.level = level; }

	public static SpeakingMessageRequestBuilder builder() {
		return new SpeakingMessageRequestBuilder();
	}

	public static class SpeakingMessageRequestBuilder {
		private Long sessionId;
		private String message;
		private String level;

		public SpeakingMessageRequestBuilder sessionId(Long sessionId) { this.sessionId = sessionId; return this; }
		public SpeakingMessageRequestBuilder message(String message) { this.message = message; return this; }
		public SpeakingMessageRequestBuilder level(String level) { this.level = level; return this; }

		public SpeakingMessageRequest build() {
			return new SpeakingMessageRequest(sessionId, message, level);
		}
	}
}
