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
public class AchievementResponse {

	private Long id;

	private String title;

	private String description;

	private Integer xpReward;

	private Integer tier;

	private Boolean unlocked;

	private LocalDateTime unlockedAt;

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }

	public Integer getXpReward() { return xpReward; }
	public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }

	public Integer getTier() { return tier; }
	public void setTier(Integer tier) { this.tier = tier; }

	public Boolean getUnlocked() { return unlocked; }
	public void setUnlocked(Boolean unlocked) { this.unlocked = unlocked; }

	public LocalDateTime getUnlockedAt() { return unlockedAt; }
	public void setUnlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static AchievementResponseBuilder builder() {
		return new AchievementResponseBuilder();
	}

	public static class AchievementResponseBuilder {
		private Long id;
		private String title;
		private String description;
		private Integer xpReward;
		private Integer tier;
		private Boolean unlocked;
		private LocalDateTime unlockedAt;
		private LocalDateTime createdAt;

		public AchievementResponseBuilder id(Long id) { this.id = id; return this; }
		public AchievementResponseBuilder title(String title) { this.title = title; return this; }
		public AchievementResponseBuilder description(String description) { this.description = description; return this; }
		public AchievementResponseBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }
		public AchievementResponseBuilder tier(Integer tier) { this.tier = tier; return this; }
		public AchievementResponseBuilder unlocked(Boolean unlocked) { this.unlocked = unlocked; return this; }
		public AchievementResponseBuilder unlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; return this; }
		public AchievementResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public AchievementResponse build() {
			return new AchievementResponse(id, title, description, xpReward, tier, unlocked, unlockedAt, createdAt);
		}
	}
}