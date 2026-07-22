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

	public String getType() { return type; }
	public void setType(String type) { this.type = type; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getActionLabel() { return actionLabel; }
	public void setActionLabel(String actionLabel) { this.actionLabel = actionLabel; }

	public Long getTargetId() { return targetId; }
	public void setTargetId(Long targetId) { this.targetId = targetId; }

	public static RecommendationResponseBuilder builder() {
		return new RecommendationResponseBuilder();
	}

	public static class RecommendationResponseBuilder {
		private String type;
		private String title;
		private String actionLabel;
		private Long targetId;

		public RecommendationResponseBuilder type(String type) { this.type = type; return this; }
		public RecommendationResponseBuilder title(String title) { this.title = title; return this; }
		public RecommendationResponseBuilder actionLabel(String actionLabel) { this.actionLabel = actionLabel; return this; }
		public RecommendationResponseBuilder targetId(Long targetId) { this.targetId = targetId; return this; }

		public RecommendationResponse build() {
			return new RecommendationResponse(type, title, actionLabel, targetId);
		}
	}
}
