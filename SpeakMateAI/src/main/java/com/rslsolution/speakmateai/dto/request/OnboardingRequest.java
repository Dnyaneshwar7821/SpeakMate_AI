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
public class OnboardingRequest {

	@NotBlank(message = "English level is required")
	private String englishLevel;

	@NotBlank(message = "Learning goal is required")
	private String learningGoal;

	@Min(value = 1, message = "Daily goal must be at least 1 minute")
	private Integer dailyGoalMinutes;

	@NotBlank(message = "Native language is required")
	private String nativeLanguage;

	@NotBlank(message = "Preferred learning time is required")
	private String preferredLearningTime;

	@NotBlank(message = "Interests are required")
	private String interests;

	private Boolean onboardingCompleted;

	private String preferredVoice;

	private String preferredAccent;

	private Boolean studyReminder;

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

	public String getPreferredVoice() { return preferredVoice; }
	public void setPreferredVoice(String preferredVoice) { this.preferredVoice = preferredVoice; }

	public String getPreferredAccent() { return preferredAccent; }
	public void setPreferredAccent(String preferredAccent) { this.preferredAccent = preferredAccent; }

	public Boolean getStudyReminder() { return studyReminder; }
	public void setStudyReminder(Boolean studyReminder) { this.studyReminder = studyReminder; }

	public static OnboardingRequestBuilder builder() {
		return new OnboardingRequestBuilder();
	}

	public static class OnboardingRequestBuilder {
		private String englishLevel;
		private String learningGoal;
		private Integer dailyGoalMinutes;
		private String nativeLanguage;
		private String preferredLearningTime;
		private String interests;
		private Boolean onboardingCompleted;
		private String preferredVoice;
		private String preferredAccent;
		private Boolean studyReminder;

		public OnboardingRequestBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
		public OnboardingRequestBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }
		public OnboardingRequestBuilder dailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; return this; }
		public OnboardingRequestBuilder nativeLanguage(String nativeLanguage) { this.nativeLanguage = nativeLanguage; return this; }
		public OnboardingRequestBuilder preferredLearningTime(String preferredLearningTime) { this.preferredLearningTime = preferredLearningTime; return this; }
		public OnboardingRequestBuilder interests(String interests) { this.interests = interests; return this; }
		public OnboardingRequestBuilder onboardingCompleted(Boolean onboardingCompleted) { this.onboardingCompleted = onboardingCompleted; return this; }
		public OnboardingRequestBuilder preferredVoice(String preferredVoice) { this.preferredVoice = preferredVoice; return this; }
		public OnboardingRequestBuilder preferredAccent(String preferredAccent) { this.preferredAccent = preferredAccent; return this; }
		public OnboardingRequestBuilder studyReminder(Boolean studyReminder) { this.studyReminder = studyReminder; return this; }

		public OnboardingRequest build() {
			return new OnboardingRequest(englishLevel, learningGoal, dailyGoalMinutes, nativeLanguage, preferredLearningTime, interests, onboardingCompleted, preferredVoice, preferredAccent, studyReminder);
		}
	}
}
