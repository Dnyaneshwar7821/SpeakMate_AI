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

}
