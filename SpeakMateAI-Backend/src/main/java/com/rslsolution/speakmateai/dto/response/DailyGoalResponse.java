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

	private Integer dailyGoalMinutes;

	private Integer targetSpeakingMinutes;

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

	public Integer getDailyGoalMinutes() { return dailyGoalMinutes; }
	public void setDailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; }

	public Integer getTargetSpeakingMinutes() { return targetSpeakingMinutes; }
	public void setTargetSpeakingMinutes(Integer targetSpeakingMinutes) { this.targetSpeakingMinutes = targetSpeakingMinutes; }

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
		private Integer dailyGoalMinutes;
		private Integer targetSpeakingMinutes;

		public DailyGoalResponseBuilder title(String title) { this.title = title; return this; }
		public DailyGoalResponseBuilder lessonsCompletedToday(Integer lessonsCompletedToday) { this.lessonsCompletedToday = lessonsCompletedToday; return this; }
		public DailyGoalResponseBuilder speakingMinutesToday(Integer speakingMinutesToday) { this.speakingMinutesToday = speakingMinutesToday; return this; }
		public DailyGoalResponseBuilder vocabularyCompleted(Integer vocabularyCompleted) { this.vocabularyCompleted = vocabularyCompleted; return this; }
		public DailyGoalResponseBuilder vocabularyTarget(Integer vocabularyTarget) { this.vocabularyTarget = vocabularyTarget; return this; }
		public DailyGoalResponseBuilder percentage(Double percentage) { this.percentage = percentage; return this; }
		public DailyGoalResponseBuilder remainingLessons(Integer remainingLessons) { this.remainingLessons = remainingLessons; return this; }
		public DailyGoalResponseBuilder dailyGoalMinutes(Integer dailyGoalMinutes) { this.dailyGoalMinutes = dailyGoalMinutes; return this; }
		public DailyGoalResponseBuilder targetSpeakingMinutes(Integer targetSpeakingMinutes) { this.targetSpeakingMinutes = targetSpeakingMinutes; return this; }

		public DailyGoalResponse build() {
            DailyGoalResponse obj = new DailyGoalResponse();
            obj.setTitle(title);
            obj.setLessonsCompletedToday(lessonsCompletedToday);
            obj.setSpeakingMinutesToday(speakingMinutesToday);
            obj.setVocabularyCompleted(vocabularyCompleted);
            obj.setVocabularyTarget(vocabularyTarget);
            obj.setPercentage(percentage);
            obj.setRemainingLessons(remainingLessons);
            obj.setDailyGoalMinutes(dailyGoalMinutes);
            obj.setTargetSpeakingMinutes(targetSpeakingMinutes);
            return obj;
        }
	}
}
