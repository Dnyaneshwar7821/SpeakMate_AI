package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson_progress",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "lesson_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "lesson_id", nullable = false)
	private Lesson lesson;

	// 0‒100 %
	@Builder.Default
	private Integer progressPercent = 0;

	@Builder.Default
	private Boolean completed = false;

	@Builder.Default
	private Integer lastSectionIndex = 0;

	private LocalDateTime lastOpenedAt;

	private LocalDateTime completedAt;

	@Builder.Default
	private Integer timeSpentMinutes = 0;

	@Builder.Default
	private Integer xpEarned = 0;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		lastOpenedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public Lesson getLesson() { return lesson; }
	public void setLesson(Lesson lesson) { this.lesson = lesson; }

	public Integer getProgressPercent() { return progressPercent; }
	public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

	public Boolean getCompleted() { return completed; }
	public void setCompleted(Boolean completed) { this.completed = completed; }

	public Integer getLastSectionIndex() { return lastSectionIndex; }
	public void setLastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; }

	public LocalDateTime getLastOpenedAt() { return lastOpenedAt; }
	public void setLastOpenedAt(LocalDateTime lastOpenedAt) { this.lastOpenedAt = lastOpenedAt; }

	public LocalDateTime getCompletedAt() { return completedAt; }
	public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

	public Integer getTimeSpentMinutes() { return timeSpentMinutes; }
	public void setTimeSpentMinutes(Integer timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static LessonProgressBuilder builder() {
		return new LessonProgressBuilder();
	}

	public static class LessonProgressBuilder {
		private Long id;
		private User user;
		private Lesson lesson;
		private Integer progressPercent = 0;
		private Boolean completed = false;
		private Integer lastSectionIndex = 0;
		private LocalDateTime lastOpenedAt;
		private LocalDateTime completedAt;
		private Integer timeSpentMinutes = 0;
		private Integer xpEarned = 0;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public LessonProgressBuilder id(Long id) { this.id = id; return this; }
		public LessonProgressBuilder user(User user) { this.user = user; return this; }
		public LessonProgressBuilder lesson(Lesson lesson) { this.lesson = lesson; return this; }
		public LessonProgressBuilder progressPercent(Integer progressPercent) { this.progressPercent = progressPercent; return this; }
		public LessonProgressBuilder completed(Boolean completed) { this.completed = completed; return this; }
		public LessonProgressBuilder lastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; return this; }
		public LessonProgressBuilder lastOpenedAt(LocalDateTime lastOpenedAt) { this.lastOpenedAt = lastOpenedAt; return this; }
		public LessonProgressBuilder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }
		public LessonProgressBuilder timeSpentMinutes(Integer timeSpentMinutes) { this.timeSpentMinutes = timeSpentMinutes; return this; }
		public LessonProgressBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public LessonProgressBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public LessonProgressBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public LessonProgress build() {
			return new LessonProgress(id, user, lesson, progressPercent, completed, lastSectionIndex, lastOpenedAt, completedAt, timeSpentMinutes, xpEarned, createdAt, updatedAt);
		}
	}
}
