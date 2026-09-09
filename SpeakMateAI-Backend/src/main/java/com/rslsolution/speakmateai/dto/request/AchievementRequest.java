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
public class AchievementRequest {

	@NotBlank(message = "Title is required")
	private String title;

	@NotBlank(message = "Description is required")
	private String description;

	@Min(value = 0, message = "XP reward cannot be negative")
	private Integer xpReward;

	private Integer tier;

	private Boolean unlocked;

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

	public static AchievementRequestBuilder builder() {
		return new AchievementRequestBuilder();
	}

	public static class AchievementRequestBuilder {
		private String title;
		private String description;
		private Integer xpReward;
		private Integer tier;
		private Boolean unlocked;

		public AchievementRequestBuilder title(String title) { this.title = title; return this; }
		public AchievementRequestBuilder description(String description) { this.description = description; return this; }
		public AchievementRequestBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }
		public AchievementRequestBuilder tier(Integer tier) { this.tier = tier; return this; }
		public AchievementRequestBuilder unlocked(Boolean unlocked) { this.unlocked = unlocked; return this; }

		public AchievementRequest build() {
            AchievementRequest obj = new AchievementRequest();
            obj.setTitle(title);
            obj.setDescription(description);
            obj.setXpReward(xpReward);
            obj.setTier(tier);
            obj.setUnlocked(unlocked);
            return obj;
        }
	}
}