package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingHistoryResponse {

	private Long id;

	private String scenario;

	private Integer duration; // in seconds

	private Integer xpEarned;

	private Double score;

	private String previewMessage; // last message or short preview

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public Double getScore() { return score; }
	public void setScore(Double score) { this.score = score; }

	public String getPreviewMessage() { return previewMessage; }
	public void setPreviewMessage(String previewMessage) { this.previewMessage = previewMessage; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static SpeakingHistoryResponseBuilder builder() {
		return new SpeakingHistoryResponseBuilder();
	}

	public static class SpeakingHistoryResponseBuilder {
		private Long id;
		private String scenario;
		private Integer duration;
		private Integer xpEarned;
		private Double score;
		private String previewMessage;
		private LocalDateTime createdAt;

		public SpeakingHistoryResponseBuilder id(Long id) { this.id = id; return this; }
		public SpeakingHistoryResponseBuilder scenario(String scenario) { this.scenario = scenario; return this; }
		public SpeakingHistoryResponseBuilder duration(Integer duration) { this.duration = duration; return this; }
		public SpeakingHistoryResponseBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public SpeakingHistoryResponseBuilder score(Double score) { this.score = score; return this; }
		public SpeakingHistoryResponseBuilder previewMessage(String previewMessage) { this.previewMessage = previewMessage; return this; }
		public SpeakingHistoryResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public SpeakingHistoryResponse build() {
            SpeakingHistoryResponse obj = new SpeakingHistoryResponse();
            obj.setId(id);
            obj.setScenario(scenario);
            obj.setDuration(duration);
            obj.setXpEarned(xpEarned);
            obj.setScore(score);
            obj.setPreviewMessage(previewMessage);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}
