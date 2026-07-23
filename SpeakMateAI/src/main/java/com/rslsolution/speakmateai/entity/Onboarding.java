package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "onboarding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Onboarding {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false, unique = true)
	private User user;

	@Column(nullable = false)
	private String englishLevel;

	@Column(nullable = false)
	private String learningGoal;

	@Column(nullable = false)
	private Integer dailyGoalMinutes;

	@Column(nullable = false)
	private String nativeLanguage;

	@Column(nullable = false)
	private String preferredLearningTime;

	@Column(nullable = false)
	private String interests;

	private String ageGroup;

	@Builder.Default
	private Boolean onboardingCompleted = false;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getEnglishLevel() { return englishLevel; }
	public void setEnglishLevel(String englishLevel) { this.englishLevel = englishLevel; }

	public String getLearningGoal() { return learningGoal; }
	public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }

	public Integer getDailyGoalMinutes() { return dailyGoalMinutes; }
	public void setDailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; }

	public String getNativeLanguage() { return nativeLanguage; }
	public void setNativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; }

	public String getPreferredLearningTime() { return preferredLearningTime; }
	public void setPreferredLearningTime(String preferredLearningTime) { this.preferredLearningTime = preferredLearningTime; }

	public String getInterests() { return interests; }
	public void setInterests(String interests) { this.interests = interests; }

	public Boolean getOnboardingCompleted() { return onboardingCompleted; }
	public void setOnboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static OnboardingBuilder builder() {
		return new OnboardingBuilder();
	}

	public static class OnboardingBuilder {
		private Long id;
		private User user;
		private String englishLevel;
		private String learningGoal;
		private Integer dailyGoalMinutes;
		private String nativeLanguage;
		private String preferredLearningTime;
		private String interests;
		private Boolean onboardingCompleted = false;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public OnboardingBuilder id(Long id) { this.id = id; return this; }
		public OnboardingBuilder user(User user) { this.user = user; return this; }
		public OnboardingBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
		public OnboardingBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }
		public OnboardingBuilder dailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; return this; }
		public OnboardingBuilder nativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; return this; }
		public OnboardingBuilder preferredLearningTime(String preferredLearningTime) { this.preferredLearningTime = preferredLearningTime; return this; }
		public OnboardingBuilder interests(String interests) { this.interests = interests; return this; }
		public OnboardingBuilder onboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; return this; }
		public OnboardingBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public OnboardingBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public Onboarding build() {
            Onboarding obj = new Onboarding();
            obj.setId(id);
            obj.setUser(user);
            obj.setEnglishLevel(englishLevel);
            obj.setLearningGoal(learningGoal);
            obj.setDailyGoalMinutes(dailyGoalMinutes);
            obj.setNativeLanguage(nativeLanguage);
            obj.setPreferredLearningTime(preferredLearningTime);
            obj.setInterests(interests);
            obj.setOnboardingCompleted(onboardingCompleted);
            obj.setCreatedAt(createdAt);
            obj.setUpdatedAt(updatedAt);
            return obj;
        }
	}
}