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

}
