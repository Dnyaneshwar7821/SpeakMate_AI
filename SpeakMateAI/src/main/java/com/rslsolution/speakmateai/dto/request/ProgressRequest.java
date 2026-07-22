package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressRequest {

	@Min(value = 0, message = "XP cannot be negative")
	private Integer xp;

	@Min(value = 1, message = "Level must be at least 1")
	private Integer level;

	@Min(value = 0, message = "Current streak cannot be negative")
	private Integer currentStreak;

	@Min(value = 0, message = "Longest streak cannot be negative")
	private Integer longestStreak;

	@Min(value = 0, message = "Practice minutes cannot be negative")
	private Integer totalPracticeMinutes;

	@Min(value = 0, message = "Speaking sessions cannot be negative")
	private Integer totalSpeakingSessions;

	@Min(value = 0, message = "Grammar checks cannot be negative")
	private Integer totalGrammarChecks;

	@Min(value = 0, message = "Vocabulary words cannot be negative")
	private Integer totalVocabularyWords;

}