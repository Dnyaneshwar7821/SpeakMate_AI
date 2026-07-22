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

}
