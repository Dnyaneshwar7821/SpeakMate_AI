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

	public String getModule() { return module; }
	public void setModule(String module) { this.module = module; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public Integer getProgressPercent() { return progressPercent; }
	public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

	public Integer getEstimatedMinutesRemaining() { return estimatedMinutesRemaining; }
	public void setEstimatedMinutesRemaining(Integer estimatedMinutesRemaining) { this.estimatedMinutesRemaining = estimatedMinutesRemaining; }

	public Long getTargetId() { return targetId; }
	public void setTargetId(Long targetId) { this.targetId = targetId; }

	public static ContinueLearningResponseBuilder builder() {
		return new ContinueLearningResponseBuilder();
	}

	public static class ContinueLearningResponseBuilder {
		private String module;
		private String title;
		private Integer progressPercent;
		private Integer estimatedMinutesRemaining;
		private Long targetId;

		public ContinueLearningResponseBuilder module(String module) { this.module = module; return this; }
		public ContinueLearningResponseBuilder title(String title) { this.title = title; return this; }
		public ContinueLearningResponseBuilder progressPercent(Integer progressPercent) { this.progressPercent = progressPercent; return this; }
		public ContinueLearningResponseBuilder estimatedMinutesRemaining(Integer estimatedMinutesRemaining) { this.estimatedMinutesRemaining = estimatedMinutesRemaining; return this; }
		public ContinueLearningResponseBuilder targetId(Long targetId) { this.targetId = targetId; return this; }

		public ContinueLearningResponse build() {
            ContinueLearningResponse obj = new ContinueLearningResponse();
            obj.setModule(module);
            obj.setTitle(title);
            obj.setProgressPercent(progressPercent);
            obj.setEstimatedMinutesRemaining(estimatedMinutesRemaining);
            obj.setTargetId(targetId);
            return obj;
        }
	}
}
