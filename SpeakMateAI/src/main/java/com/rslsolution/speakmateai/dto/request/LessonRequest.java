package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonRequest {

	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Category is required")
	private String category;

	@NotBlank(message = "Level is required")
	private String level;

	@NotBlank(message = "Description is required")
	private String description;

	private String content;

	@Min(value = 1, message = "Duration must be at least 1 minute")
	private Integer duration;

	private Boolean active;

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
}