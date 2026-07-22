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

	@NotBlank(message = "Transcript is required")
	private String transcript;

	@NotNull(message = "Duration is required")
	@Min(value = 1, message = "Duration must be greater than 0")
	private Integer duration;

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getTranscript() { return transcript; }
	public void setTranscript(String transcript) { this.transcript = transcript; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public static SpeakingSessionRequestBuilder builder() {
		return new SpeakingSessionRequestBuilder();
	}

	public static class SpeakingSessionRequestBuilder {
		private String topic;
		private String transcript;
		private Integer duration;

		public SpeakingSessionRequestBuilder topic(String topic) { this.topic = topic; return this; }
		public SpeakingSessionRequestBuilder transcript(String transcript) { this.transcript = transcript; return this; }
		public SpeakingSessionRequestBuilder duration(Integer duration) { this.duration = duration; return this; }

		public SpeakingSessionRequest build() {
			return new SpeakingSessionRequest(topic, transcript, duration);
		}
	}
}