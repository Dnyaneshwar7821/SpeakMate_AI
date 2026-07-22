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
public class ProgressResponse {

	private Long id;

	private Integer xp;

	private Integer level;

	private Integer currentStreak;

	private Integer longestStreak;

	private Integer totalPracticeMinutes;

	private Integer totalSpeakingSessions;

	private Integer totalGrammarChecks;

	private Integer totalVocabularyWords;

	private LocalDateTime createdAt;

	private LocalDateTime updatedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

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

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static ProgressResponseBuilder builder() {
		return new ProgressResponseBuilder();
	}

	public static class ProgressResponseBuilder {
		private Long id;
		private Integer xp;
		private Integer level;
		private Integer currentStreak;
		private Integer longestStreak;
		private Integer totalPracticeMinutes;
		private Integer totalSpeakingSessions;
		private Integer totalGrammarChecks;
		private Integer totalVocabularyWords;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public ProgressResponseBuilder id(Long id) { this.id = id; return this; }
		public ProgressResponseBuilder xp(Integer xp) { this.xp = xp; return this; }
		public ProgressResponseBuilder level(Integer level) { this.level = level; return this; }
		public ProgressResponseBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
		public ProgressResponseBuilder longestStreak(Integer longestStreak) { this.longestStreak = longestStreak; return this; }
		public ProgressResponseBuilder totalPracticeMinutes(Integer totalPracticeMinutes) { this.totalPracticeMinutes = totalPracticeMinutes; return this; }
		public ProgressResponseBuilder totalSpeakingSessions(Integer totalSpeakingSessions) { this.totalSpeakingSessions = totalSpeakingSessions; return this; }
		public ProgressResponseBuilder totalGrammarChecks(Integer totalGrammarChecks) { this.totalGrammarChecks = totalGrammarChecks; return this; }
		public ProgressResponseBuilder totalVocabularyWords(Integer totalVocabularyWords) { this.totalVocabularyWords = totalVocabularyWords; return this; }
		public ProgressResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public ProgressResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public ProgressResponse build() {
			return new ProgressResponse(id, xp, level, currentStreak, longestStreak, totalPracticeMinutes, totalSpeakingSessions, totalGrammarChecks, totalVocabularyWords, createdAt, updatedAt);
		}
	}
}