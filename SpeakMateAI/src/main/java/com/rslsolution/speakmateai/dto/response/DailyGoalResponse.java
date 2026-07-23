package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyGoalResponse {

	private String title;

	private Integer lessonsCompletedToday;

	private Integer speakingMinutesToday;

	private Integer vocabularyCompleted;

	private Integer vocabularyTarget;

	private Double percentage;

	private Integer remainingLessons;

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public Integer getLessonsCompletedToday() { return lessonsCompletedToday; }
	public void setLessonsCompletedToday(Integer lessonsCompletedToday) { this.lessonsCompletedToday = lessonsCompletedToday; }

	public Integer getSpeakingMinutesToday() { return speakingMinutesToday; }
	public void setSpeakingMinutesToday(Integer speakingMinutesToday) { this.speakingMinutesToday = speakingMinutesToday; }

	public Integer getVocabularyCompleted() { return vocabularyCompleted; }
	public void setVocabularyCompleted(Integer vocabularyCompleted) { this.vocabularyCompleted = vocabularyCompleted; }

	public Integer getVocabularyTarget() { return vocabularyTarget; }
	public void setVocabularyTarget(Integer vocabularyTarget) { this.vocabularyTarget = vocabularyTarget; }

	public Double getPercentage() { return percentage; }
	public void setPercentage(Double percentage) { this.percentage = percentage; }

	public Integer getRemainingLessons() { return remainingLessons; }
	public void setRemainingLessons(Integer remainingLessons) { this.remainingLessons = remainingLessons; }

	public static DailyGoalResponseBuilder builder() {
		return new DailyGoalResponseBuilder();
	}

	public static class DailyGoalResponseBuilder {
		private String title;
		private Integer lessonsCompletedToday;
		private Integer speakingMinutesToday;
		private Integer vocabularyCompleted;
		private Integer vocabularyTarget;
		private Double percentage;
		private Integer remainingLessons;

		public DailyGoalResponseBuilder title(String title) { this.title = title; return this; }
		public DailyGoalResponseBuilder lessonsCompletedToday(Integer lessonsCompletedToday) { this.lessonsCompletedToday = lessonsCompletedToday; return this; }
		public DailyGoalResponseBuilder speakingMinutesToday(Integer speakingMinutesToday) { this.speakingMinutesToday = speakingMinutesToday; return this; }
		public DailyGoalResponseBuilder vocabularyCompleted(Integer vocabularyCompleted) { this.vocabularyCompleted = vocabularyCompleted; return this; }
		public DailyGoalResponseBuilder vocabularyTarget(Integer vocabularyTarget) { this.vocabularyTarget = vocabularyTarget; return this; }
		public DailyGoalResponseBuilder percentage(Double percentage) { this.percentage = percentage; return this; }
		public DailyGoalResponseBuilder remainingLessons(Integer remainingLessons) { this.remainingLessons = remainingLessons; return this; }

		public DailyGoalResponse build() {
			return new DailyGoalResponse(title, lessonsCompletedToday, speakingMinutesToday, vocabularyCompleted, vocabularyTarget, percentage, remainingLessons);
		}
	}
}
