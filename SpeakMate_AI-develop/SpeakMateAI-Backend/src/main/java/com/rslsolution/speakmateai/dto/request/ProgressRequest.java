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

	public Integer getXp() { return xp; }
	public void setXp(Integer xp) { this.xp = xp; }

	public Integer getLevel() { return level; }
	public void setLevel(Integer level) { this.level = level; }

	public Integer getCurrentStreak() { return currentStreak; }
	public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

	public Integer getLongestStreak() { return longestStreak; }
	public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }

	public Integer getTotalPracticeMinutes() { return totalPracticeMinutes; }
	public void setTotalPracticeMinutes(Integer totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; }

	public Integer getTotalSpeakingSessions() { return totalSpeakingSessions; }
	public void setTotalSpeakingSessions(Integer totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; }

	public Integer getTotalGrammarChecks() { return totalGrammarChecks; }
	public void setTotalGrammarChecks(Integer totalGrammarChecks) { this.totalGrammarChecks = totalGrammarChecks; }

	public Integer getTotalVocabularyWords() { return totalVocabularyWords; }
	public void setTotalVocabularyWords(Integer totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; }

	public static ProgressRequestBuilder builder() {
		return new ProgressRequestBuilder();
	}

	public static class ProgressRequestBuilder {
		private Integer xp;
		private Integer level;
		private Integer currentStreak;
		private Integer longestStreak;
		private Integer totalPracticeMinutes;
		private Integer totalSpeakingSessions;
		private Integer totalGrammarChecks;
		private Integer totalVocabularyWords;

		public ProgressRequestBuilder xp(Integer xp) { this.xp = xp; return this; }
		public ProgressRequestBuilder level(Integer level) { this.level = level; return this; }
		public ProgressRequestBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
		public ProgressRequestBuilder longestStreak(Integer longestStreak) { this.longestStreak = longestStreak; return this; }
		public ProgressRequestBuilder totalPracticeMinutes(Integer totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; return this; }
		public ProgressRequestBuilder totalSpeakingSessions(Integer totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; return this; }
		public ProgressRequestBuilder totalGrammarChecks(Integer totalGrammarChecks) { this.totalGrammarChecks = totalGrammarChecks; return this; }
		public ProgressRequestBuilder totalVocabularyWords(Integer totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; return this; }

		public ProgressRequest build() {
            ProgressRequest obj = new ProgressRequest();
            obj.setXp(xp);
            obj.setLevel(level);
            obj.setCurrentStreak(currentStreak);
            obj.setLongestStreak(longestStreak);
            obj.setTotalPracticeMinutes(totalPracticeMinutes);
            obj.setTotalSpeakingSessions(totalSpeakingSessions);
            obj.setTotalGrammarChecks(totalGrammarChecks);
            obj.setTotalVocabularyWords(totalVocabularyWords);
            return obj;
        }
	}
}