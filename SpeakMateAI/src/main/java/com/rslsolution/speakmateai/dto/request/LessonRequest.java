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

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getCategory() { return category; }
	public void setCategory(String category) { this.category = category; }

	public String getLevel() { return level; }
	public void setLevel(String level) { this.level = level; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public String getContent() { return content; }
	public void setContent(String content) { this.content = content; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public Boolean getActive() { return active; }
	public void setActive(Boolean active) { this.active = active; }

	public Integer getXpReward() { return xpReward; }
	public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

	public String getThumbnail() { return thumbnail; }
	public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

	public String getCoverImage() { return coverImage; }
	public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

	public Boolean getLocked() { return locked; }
	public void setLocked(Boolean locked) { this.locked = locked; }

	public Integer getRequiredXP() { return requiredXP; }
	public void setRequiredXP(Integer requiredXP) { this.requiredXP = requiredXP; }

	public Integer getRequiredLevel() { return requiredLevel; }
	public void setRequiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; }

	public Integer getEstimatedMinutes() { return estimatedMinutes; }
	public void setEstimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; }

	public Integer getOrderIndex() { return orderIndex; }
	public void setOrderIndex(Integer orderIndex) { this.orderIndex = orderIndex; }

	public String getSkills() { return skills; }
	public void setSkills(String skills) { this.skills = skills; }

	public String getObjectives() { return objectives; }
	public void setObjectives(String objectives) { this.objectives = objectives; }

	public String getRequirements() { return requirements; }
	public void setRequirements(String requirements) { this.requirements = requirements; }

	public Boolean getPopular() { return popular; }
	public void setPopular(Boolean popular) { this.popular = popular; }

	public Boolean getFeatured() { return featured; }
	public void setFeatured(Boolean featured) { this.featured = featured; }

	public static LessonRequestBuilder builder() {
		return new LessonRequestBuilder();
	}

	public static class LessonRequestBuilder {
		private String title;
		private String category;
		private String level;
		private String description;
		private String content;
		private Integer duration;
		private Boolean active;
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

		public LessonRequestBuilder title(String title) { this.title = title; return this; }
		public LessonRequestBuilder category(String category) { this.category = category; return this; }
		public LessonRequestBuilder level(String level) { this.level = level; return this; }
		public LessonRequestBuilder description(String description) { this.description = description; return this; }
		public LessonRequestBuilder content(String content) { this.content = content; return this; }
		public LessonRequestBuilder duration(Integer duration) { this.duration = duration; return this; }
		public LessonRequestBuilder active(Boolean active) { this.active = active; return this; }
		public LessonRequestBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }
		public LessonRequestBuilder thumbnail(String thumbnail) { this.thumbnail = thumbnail; return this; }
		public LessonRequestBuilder coverImage(String coverImage) { this.coverImage = coverImage; return this; }
		public LessonRequestBuilder locked(Boolean locked) { this.locked = locked; return this; }
		public LessonRequestBuilder requiredXP(Integer requiredXP) { this.requiredXP = requiredXP; return this; }
		public LessonRequestBuilder requiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; return this; }
		public LessonRequestBuilder estimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; return this; }
		public LessonRequestBuilder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
		public LessonRequestBuilder skills(String skills) { this.skills = skills; return this; }
		public LessonRequestBuilder objectives(String objectives) { this.objectives = objectives; return this; }
		public LessonRequestBuilder requirements(String requirements) { this.requirements = requirements; return this; }
		public LessonRequestBuilder popular(Boolean popular) { this.popular = popular; return this; }
		public LessonRequestBuilder featured(Boolean featured) { this.featured = featured; return this; }

		public LessonRequest build() {
			return new LessonRequest(title, category, level, description, content, duration, active, xpReward, thumbnail, coverImage, locked, requiredXP, requiredLevel, estimatedMinutes, orderIndex, skills, objectives, requirements, popular, featured);
		}
	}
}