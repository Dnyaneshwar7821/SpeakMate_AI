package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

	private Long id;

	private String firstName;

	private String lastName;

	private String email;

	private Role role;

	private String avatar;

	private boolean active;

	private LocalDateTime createdAt;

	private boolean welcomeCompleted;

	private boolean onboardingCompleted;

	private String authProvider;

	private String nativeLanguage;

	private String englishLevel;

	private String learningGoal;

	private Integer dailyGoalMinutes;

	private String preferredVoice;

	private String preferredAccent;

	private String interests;
}