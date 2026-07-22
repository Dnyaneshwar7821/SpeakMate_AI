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
public class LessonProgressResponse {

	private Long id;
	private Long lessonId;
	private String lessonTitle;
	private String lessonCategory;
	private String lessonLevel;
	private Integer progressPercent;
	private Boolean completed;
	private Integer lastSectionIndex;
	private Integer timeSpentMinutes;
	private Integer xpEarned;
	private LocalDateTime lastOpenedAt;
	private LocalDateTime completedAt;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public Long getLessonId() { return lessonId; }
	public void setLessonId(Long lessonId) { this.lessonId = lessonId; }

	public String getLessonTitle() { return lessonTitle; }
	public void setLessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; }

	public String getLessonCategory() { return lessonCategory; }
	public void setLessonCategory(String lessonCategory) { this.lessonCategory = lessonCategory; }

	public String getLessonLevel() { return lessonLevel; }
	public void setLessonLevel(String lessonLevel) { this.lessonLevel = lessonLevel; }

	public Integer getProgressPercent() { return progressPercent; }
	public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

	public Boolean getCompleted() { return completed; }
	public void setCompleted(Boolean completed) { this.completed = completed; }

	public Integer getLastSectionIndex() { return lastSectionIndex; }
	public void setLastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; }

	public Integer getTimeSpentMinutes() { return timeSpentMinutes; }
	public void setTimeSpentMinutes(Integer timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public LocalDateTime getLastOpenedAt() { return lastOpenedAt; }
	public void setLastOpenedAt(LocalDateTime lastOpenedAt) { this.lastOpenedAt = lastOpenedAt; }

	public LocalDateTime getCompletedAt() { return completedAt; }
	public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static LessonProgressResponseBuilder builder() {
		return new LessonProgressResponseBuilder();
	}

	public static class LessonProgressResponseBuilder {
		private Long id;
		private Long lessonId;
		private String lessonTitle;
		private String lessonCategory;
		private String lessonLevel;
		private Integer progressPercent;
		private Boolean completed;
		private Integer lastSectionIndex;
		private Integer timeSpentMinutes;
		private Integer xpEarned;
		private LocalDateTime lastOpenedAt;
		private LocalDateTime completedAt;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public LessonProgressResponseBuilder id(Long id) { this.id = id; return this; }
		public LessonProgressResponseBuilder lessonId(Long lessonId) { this.lessonId = lessonId; return this; }
		public LessonProgressResponseBuilder lessonTitle(String lessonTitle) { this.lessonTitle = lessonTitle; return this; }
		public LessonProgressResponseBuilder lessonCategory(String lessonCategory) { this.lessonCategory = lessonCategory; return this; }
		public LessonProgressResponseBuilder lessonLevel(String lessonLevel) { this.lessonLevel = lessonLevel; return this; }
		public LessonProgressResponseBuilder progressPercent(Integer progressPercent) { this.progressPercent = progressPercent; return this; }
		public LessonProgressResponseBuilder completed(Boolean completed) { this.completed = completed; return this; }
		public LessonProgressResponseBuilder lastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; return this; }
		public LessonProgressResponseBuilder timeSpentMinutes(Integer timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; return this; }
		public LessonProgressResponseBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public LessonProgressResponseBuilder lastOpenedAt(LocalDateTime lastOpenedAt) { this.lastOpenedAt = lastOpenedAt; return this; }
		public LessonProgressResponseBuilder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }
		public LessonProgressResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public LessonProgressResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public LessonProgressResponse build() {
			return new LessonProgressResponse(id, lessonId, lessonTitle, lessonCategory, lessonLevel, progressPercent, completed, lastSectionIndex, timeSpentMinutes, xpEarned, lastOpenedAt, completedAt, createdAt, updatedAt);
		}
	}
}
