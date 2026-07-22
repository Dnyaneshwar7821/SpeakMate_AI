package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "achievement")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Achievement {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	private Integer xpReward;

	@Builder.Default
	@Column(nullable = false)
	private Integer tier = 1;

	private Boolean unlocked;

	private LocalDateTime unlockedAt;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

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

	public static AchievementBuilder builder() {
		return new AchievementBuilder();
	}

	public static class AchievementBuilder {
		private Long id;
		private User user;
		private String title;
		private String description;
		private Integer xpReward;
		private Integer tier = 1;
		private Boolean unlocked;
		private LocalDateTime unlockedAt;
		private LocalDateTime createdAt;

		public AchievementBuilder id(Long id) { this.id = id; return this; }
		public AchievementBuilder user(User user) { this.user = user; return this; }
		public AchievementBuilder title(String title) { this.title = title; return this; }
		public AchievementBuilder description(String description) { this.description = description; return this; }
		public AchievementBuilder xpReward(Integer xpReward) { this.xpReward = xpReward; return this; }
		public AchievementBuilder tier(Integer tier) { this.tier = tier; return this; }
		public AchievementBuilder unlocked(Boolean unlocked) { this.unlocked = unlocked; return this; }
		public AchievementBuilder unlockedAt(LocalDateTime unlockedAt) { this.unlockedAt = unlockedAt; return this; }
		public AchievementBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public Achievement build() {
			return new Achievement(id, user, title, description, xpReward, tier, unlocked, unlockedAt, createdAt);
		}
	}
}