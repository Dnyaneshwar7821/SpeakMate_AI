package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lessons")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	@Column(nullable = false)
	private String category;

	// difficulty: Beginner / Intermediate / Advanced
	@Column(nullable = false)
	private String level;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(columnDefinition = "LONGTEXT")
	private String content;

	// ── New lesson-module fields ──────────────────────────────────────
	private Integer xpReward;

	private String thumbnail;

	private String coverImage;

	@Builder.Default
	private Boolean locked = false;

	@Builder.Default
	private Integer requiredXP = 0;

	@Builder.Default
	private Integer requiredLevel = 1;

	// estimatedMinutes is the canonical "how long" field; duration kept for compat
	private Integer estimatedMinutes;

	// ordering within a category
	@Builder.Default
	private Integer orderIndex = 0;

	// comma-separated skill tags, e.g. "Pronunciation,Fluency"
	@Column(columnDefinition = "TEXT")
	private String skills;

	// comma-separated learning objectives
	@Column(columnDefinition = "TEXT")
	private String objectives;

	// prerequisites / requirements description
	@Column(columnDefinition = "TEXT")
	private String requirements;

	@Builder.Default
	private Boolean popular = false;

	@Builder.Default
	private Boolean featured = false;

	// ── Original fields ───────────────────────────────────────────────
	@Builder.Default
	private Integer duration = 10;

	@Builder.Default
	private Boolean active = true;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
		if (estimatedMinutes == null && duration != null) {
			estimatedMinutes = duration;
		}
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}
}