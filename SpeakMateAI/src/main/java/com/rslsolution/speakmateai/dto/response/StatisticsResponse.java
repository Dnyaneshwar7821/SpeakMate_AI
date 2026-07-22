package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatisticsResponse {

	private Integer totalLessons;

	private Integer completedLessons;

	private Integer speakingSessions;

	private Integer vocabularyLearned;

	private Integer grammarExercises;

	private Double totalStudyHours;

	private Integer currentStreak;

	private Integer longestStreak;

	private Integer averageScore;

	public Integer getTotalLessons() { return totalLessons; }
	public void setTotalLessons(Integer totalLessons) { this.totalLessons = totalLessons; }

	public Integer getCompletedLessons() { return completedLessons; }
	public void setCompletedLessons(Integer completedLessons) { this.completedLessons = completedLessons; }

	public Integer getSpeakingSessions() { return speakingSessions; }
	public void setSpeakingSessions(Integer speakingSessions) { this.speakingSessions = speakingSessions; }

	public Integer getVocabularyLearned() { return vocabularyLearned; }
	public void setVocabularyLearned(Integer vocabularyLearned) { this.vocabularyLearned = vocabularyLearned; }

	public Integer getGrammarExercises() { return grammarExercises; }
	public void setGrammarExercises(Integer grammarExercises) { this.grammarExercises = grammarExercises; }

	public Double getTotalStudyHours() { return totalStudyHours; }
	public void setTotalStudyHours(Double totalStudyHours) { this.totalStudyHours = totalStudyHours; }

	public Integer getCurrentStreak() { return currentStreak; }
	public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }

	public Integer getLongestStreak() { return longestStreak; }
	public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }

	public Integer getAverageScore() { return averageScore; }
	public void setAverageScore(Integer averageScore) { this.averageScore = averageScore; }

	public static StatisticsResponseBuilder builder() {
		return new StatisticsResponseBuilder();
	}

	public static class StatisticsResponseBuilder {
		private Integer totalLessons;
		private Integer completedLessons;
		private Integer speakingSessions;
		private Integer vocabularyLearned;
		private Integer grammarExercises;
		private Double totalStudyHours;
		private Integer currentStreak;
		private Integer longestStreak;
		private Integer averageScore;

		public StatisticsResponseBuilder totalLessons(Integer totalLessons) { this.totalLessons = totalLessons; return this; }
		public StatisticsResponseBuilder completedLessons(Integer completedLessons) { this.completedLessons = completedLessons; return this; }
		public StatisticsResponseBuilder speakingSessions(Integer speakingSessions) { this.speakingSessions = speakingSessions; return this; }
		public StatisticsResponseBuilder vocabularyLearned(Integer vocabularyLearned) { this.vocabularyLearned = vocabularyLearned; return this; }
		public StatisticsResponseBuilder grammarExercises(Integer grammarExercises) { this.grammarExercises = grammarExercises; return this; }
		public StatisticsResponseBuilder totalStudyHours(Double totalStudyHours) { this.totalStudyHours = totalStudyHours; return this; }
		public StatisticsResponseBuilder currentStreak(Integer currentStreak) { this.currentStreak = currentStreak; return this; }
		public StatisticsResponseBuilder longestStreak(Integer longestStreak) { this.longestStreak = longestStreak; return this; }
		public StatisticsResponseBuilder averageScore(Integer averageScore) { this.averageScore = averageScore; return this; }

		public StatisticsResponse build() {
			return new StatisticsResponse(totalLessons, completedLessons, speakingSessions, vocabularyLearned, grammarExercises, totalStudyHours, currentStreak, longestStreak, averageScore);
		}
	}
}
