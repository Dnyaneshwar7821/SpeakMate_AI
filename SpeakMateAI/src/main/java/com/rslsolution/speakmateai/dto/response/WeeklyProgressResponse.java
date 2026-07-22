package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyProgressResponse {

	private String day;

	private Integer studyMinutes;

	private Integer lessonsCompleted;

	private Integer speakingSessions;

	public String getDay() { return day; }
	public void setDay(String day) { this.day = day; }

	public Integer getStudyMinutes() { return studyMinutes; }
	public void setStudyMinutes(Integer studyMinutes) { this.studyMinutes = studyMinutes; }

	public Integer getLessonsCompleted() { return lessonsCompleted; }
	public void setLessonsCompleted(Integer lessonsCompleted) { this.lessonsCompleted = lessonsCompleted; }

	public Integer getSpeakingSessions() { return speakingSessions; }
	public void setSpeakingSessions(Integer speakingSessions) { this.speakingSessions = speakingSessions; }

	public static WeeklyProgressResponseBuilder builder() {
		return new WeeklyProgressResponseBuilder();
	}

	public static class WeeklyProgressResponseBuilder {
		private String day;
		private Integer studyMinutes;
		private Integer lessonsCompleted;
		private Integer speakingSessions;

		public WeeklyProgressResponseBuilder day(String day) { this.day = day; return this; }
		public WeeklyProgressResponseBuilder studyMinutes(Integer studyMinutes) { this.studyMinutes = studyMinutes; return this; }
		public WeeklyProgressResponseBuilder lessonsCompleted(Integer lessonsCompleted) { this.lessonsCompleted = lessonsCompleted; return this; }
		public WeeklyProgressResponseBuilder speakingSessions(Integer speakingSessions) { this.speakingSessions = speakingSessions; return this; }

		public WeeklyProgressResponse build() {
			return new WeeklyProgressResponse(day, studyMinutes, lessonsCompleted, speakingSessions);
		}
	}
}
