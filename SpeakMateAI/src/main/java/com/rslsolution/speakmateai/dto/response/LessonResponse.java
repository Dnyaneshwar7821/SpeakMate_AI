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

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

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

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

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

	public Integer getProgressPercent() { return progressPercent; }
	public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }

	public Boolean getCompleted() { return completed; }
	public void setCompleted(Boolean completed) { this.completed = completed; }

	public Integer getLastSectionIndex() { return lastSectionIndex; }
	public void setLastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public LocalDateTime getLastOpenedAt() { return lastOpenedAt; }
	public void setLastOpenedAt(LocalDateTime lastOpenedAt) { this.lastOpenedAt = lastOpenedAt; }

	public LocalDateTime getCompletedAt() { return completedAt; }
	public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

	public static LessonResponseBuilder builder() {
		return new LessonResponseBuilder();
	}

	public static class LessonResponseBuilder {
		private Long id;
		private String title;
		private String category;
		private String level;
		private String description;
		private String content;
		private Integer duration;
		private Boolean active;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;
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
		private Integer progressPercent;
		private Boolean completed;
		private Integer lastSectionIndex;
		private Integer xpEarned;
		private LocalDateTime lastOpenedAt;
		private LocalDateTime completedAt;

		public LessonResponseBuilder id(Long id) { this.id = id; return this; }
		public LessonResponseBuilder title(String title) { this.title = title; return this; }
		public LessonResponseBuilder category(String category) { this.category = category; return this; }
		public LessonResponseBuilder level(String level) { this.level = level; return this; }
		public LessonResponseBuilder description(String description) { this.description = description; return this; }
		public LessonResponseBuilder content(String content) { this.content = content; return this; }
		public LessonResponseBuilder duration(Integer duration) { this.duration = duration; return this; }
		public LessonResponseBuilder active(Boolean active) { this.active = active; return this; }
		public LessonResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public LessonResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
		public LessonResponseBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }
		public LessonResponseBuilder thumbnail(String thumbnail) { this.thumbnail = thumbnail; return this; }
		public LessonResponseBuilder coverImage(String coverImage) { this.coverImage = coverImage; return this; }
		public LessonResponseBuilder locked(Boolean locked) { this.locked = locked; return this; }
		public LessonResponseBuilder requiredXP(Integer requiredXP) { this.requiredXP = requiredXP; return this; }
		public LessonResponseBuilder requiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; return this; }
		public LessonResponseBuilder estimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; return this; }
		public LessonResponseBuilder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
		public LessonResponseBuilder skills(String skills) { this.skills = skills; return this; }
		public LessonResponseBuilder objectives(String objectives) { this.objectives = objectives; return this; }
		public LessonResponseBuilder requirements(String requirements) { this.requirements = requirements; return this; }
		public LessonResponseBuilder popular(Boolean popular) { this.popular = popular; return this; }
		public LessonResponseBuilder featured(Boolean featured) { this.featured = featured; return this; }
		public LessonResponseBuilder progressPercent(Integer progressPercent) { this.progressPercent = progressPercent; return this; }
		public LessonResponseBuilder completed(Boolean completed) { this.completed = completed; return this; }
		public LessonResponseBuilder lastSectionIndex(Integer lastSectionIndex) { this.lastSectionIndex = lastSectionIndex; return this; }
		public LessonResponseBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public LessonResponseBuilder lastOpenedAt(LocalDateTime lastOpenedAt) { this.lastOpenedAt = lastOpenedAt; return this; }
		public LessonResponseBuilder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }

		public LessonResponse build() {
			return new LessonResponse(id, title, category, level, description, content, duration, active, createdAt, updatedAt, xpReward, thumbnail, coverImage, locked, requiredXP, requiredLevel, estimatedMinutes, orderIndex, skills, objectives, requirements, popular, featured, progressPercent, completed, lastSectionIndex, xpEarned, lastOpenedAt, completedAt);
		}
	}
}