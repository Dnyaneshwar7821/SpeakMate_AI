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
public class LessonResponse {

	private Long id;
	private String title;
	private String category;
	private String level;       // difficulty: Beginner / Intermediate / Advanced
	private String description;
	private String content;
	private Integer duration;
	private Boolean active;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	// ── Phase 2 fields ────────────────────────────────────────────────
	private Integer xpReward;
	private String thumbnail;
	private String coverImage;
	private Boolean locked;
	private Integer requiredXP;
	private Integer requiredLevel;
	private Integer estimatedMinutes;
	private Integer orderIndex;
	private String skills;
	private String objectives;
	private String requirements;
	private Boolean popular;
	private Boolean featured;

	// ── Per-user progress (null when not started) ─────────────────────
	private Integer progressPercent;
	private Boolean completed;
	private Integer lastSectionIndex;
	private Integer xpEarned;
	private LocalDateTime lastOpenedAt;
	private LocalDateTime completedAt;
}