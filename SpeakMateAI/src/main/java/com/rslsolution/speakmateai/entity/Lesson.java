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

	@Column(columnDefinition = "TEXT")
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

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public Boolean getActive() { return active; }
	public void setActive(Boolean active) { this.active = active; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static LessonBuilder builder() {
		return new LessonBuilder();
	}

	public static class LessonBuilder {
		private Long id;
		private String title;
		private String category;
		private String level;
		private String description;
		private String content;
		private Integer xpReward;
		private String thumbnail;
		private String coverImage;
		private Boolean locked = false;
		private Integer requiredXP = 0;
		private Integer requiredLevel = 1;
		private Integer estimatedMinutes;
		private Integer orderIndex = 0;
		private String skills;
		private String objectives;
		private String requirements;
		private Boolean popular = false;
		private Boolean featured = false;
		private Integer duration = 10;
		private Boolean active = true;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public LessonBuilder id(Long id) { this.id = id; return this; }
		public LessonBuilder title(String title) { this.title = title; return this; }
		public LessonBuilder category(String category) { this.category = category; return this; }
		public LessonBuilder level(String level) { this.level = level; return this; }
		public LessonBuilder description(String description) { this.description = description; return this; }
		public LessonBuilder content(String content) { this.content = content; return this; }
		public LessonBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }
		public LessonBuilder thumbnail(String thumbnail) { this.thumbnail = thumbnail; return this; }
		public LessonBuilder coverImage(String coverImage) { this.coverImage = coverImage; return this; }
		public LessonBuilder locked(Boolean locked) { this.locked = locked; return this; }
		public LessonBuilder requiredXP(Integer requiredXP) { this.requiredXP = requiredXP; return this; }
		public LessonBuilder requiredLevel(Integer requiredLevel) { this.requiredLevel = requiredLevel; return this; }
		public LessonBuilder estimatedMinutes(Integer estimatedMinutes) { this.estimatedMinutes = estimatedMinutes; return this; }
		public LessonBuilder orderIndex(Integer orderIndex) { this.orderIndex = orderIndex; return this; }
		public LessonBuilder skills(String skills) { this.skills = skills; return this; }
		public LessonBuilder objectives(String objectives) { this.objectives = objectives; return this; }
		public LessonBuilder requirements(String requirements) { this.requirements = requirements; return this; }
		public LessonBuilder popular(Boolean popular) { this.popular = popular; return this; }
		public LessonBuilder featured(Boolean featured) { this.featured = featured; return this; }
		public LessonBuilder duration(Integer duration) { this.duration = duration; return this; }
		public LessonBuilder active(Boolean active) { this.active = active; return this; }
		public LessonBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public LessonBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public Lesson build() {
			return new Lesson(id, title, category, level, description, content, xpReward, thumbnail, coverImage, locked, requiredXP, requiredLevel, estimatedMinutes, orderIndex, skills, objectives, requirements, popular, featured, duration, active, createdAt, updatedAt);
		}
	}
}