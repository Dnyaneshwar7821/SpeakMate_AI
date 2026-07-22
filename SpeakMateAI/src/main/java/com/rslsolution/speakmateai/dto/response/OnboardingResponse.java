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
public class OnboardingResponse {

	private Long id;

	private String englishLevel;

	private String learningGoal;

	private Integer dailyGoalMinutes;

	private String nativeLanguage;

	private String preferredLearningTime;

	private String interests;

	private Boolean onboardingCompleted;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

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

	public static OnboardingResponseBuilder builder() {
		return new OnboardingResponseBuilder();
	}

	public static class OnboardingResponseBuilder {
		private Long id;
		private String englishLevel;
		private String learningGoal;
		private Integer dailyGoalMinutes;
		private String nativeLanguage;
		private String preferredLearningTime;
		private String interests;
		private Boolean onboardingCompleted;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public OnboardingResponseBuilder id(Long id) { this.id = id; return this; }
		public OnboardingResponseBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
		public OnboardingResponseBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }
		public OnboardingResponseBuilder dailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; return this; }
		public OnboardingResponseBuilder nativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; return this; }
		public OnboardingResponseBuilder preferredLearningTime(String preferredLearningTime) { this.preferredLearningTime = preferredLearningTime; return this; }
		public OnboardingResponseBuilder interests(String interests) { this.interests = interests; return this; }
		public OnboardingResponseBuilder onboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; return this; }
		public OnboardingResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public OnboardingResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public OnboardingResponse build() {
			return new OnboardingResponse(id, englishLevel, learningGoal, dailyGoalMinutes, nativeLanguage, preferredLearningTime, interests, onboardingCompleted, createdAt, updatedAt);
		}
	}
}