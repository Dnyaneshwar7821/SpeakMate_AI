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
}
