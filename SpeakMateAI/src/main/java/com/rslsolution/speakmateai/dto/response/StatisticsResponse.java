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

}
