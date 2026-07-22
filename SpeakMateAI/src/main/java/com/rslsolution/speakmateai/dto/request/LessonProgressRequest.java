package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgressRequest {

	@NotNull(message = "Lesson ID is required")
	private Long lessonId;

	@Min(0) @Max(100)
	private Integer progressPercent;

	@Min(0)
	private Integer lastSectionIndex;

	@Min(0)
	private Integer timeSpentMinutes;

	public Long getLessonId() { return lessonId; }
	public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

	public Integer getProgressPercent() { return progressPercent; }
	public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

	public Integer getLastSectionIndex() { return lastSectionIndex; }
	public void setLastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; }

	public Integer getTimeSpentMinutes() { return timeSpentMinutes; }
	public void setTimeSpentMinutes(Integer timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }

	public static LessonProgressRequestBuilder builder() {
		return new LessonProgressRequestBuilder();
	}

	public static class LessonProgressRequestBuilder {
		private Long lessonId;
		private Integer progressPercent;
		private Integer lastSectionIndex;
		private Integer timeSpentMinutes;

		public LessonProgressRequestBuilder lessonId(Long lessonId) { this.lessonId = lessonId; return this; }
		public LessonProgressRequestBuilder progressPercent(Integer progressPercent) { this.progressPercent = progressPercent; return this; }
		public LessonProgressRequestBuilder lastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; return this; }
		public LessonProgressRequestBuilder timeSpentMinutes(Integer timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; return this; }

		public LessonProgressRequest build() {
			return new LessonProgressRequest(lessonId, progressPercent, lastSectionIndex, timeSpentMinutes);
		}
	}
}
