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

}