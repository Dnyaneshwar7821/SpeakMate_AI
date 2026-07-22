package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileResponse {

	private Long id;

	private String firstName;

	private String lastName;

	private String email;

	private String role;

	private String avatar;

	private String englishLevel;

	private String learningGoal;

	private Integer xp;

	private Integer level;

	private Integer currentStreak;

	private Integer longestStreak;

	private Integer totalPracticeMinutes;

	private Integer totalSpeakingSessions;

	private Integer totalGrammarChecks;

	private Integer totalVocabularyWords;
}