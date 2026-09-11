package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceTrendResponse {
	private String period;
	private Double averageScore;
	private Integer sessionsCompleted;
	private Integer lessonsCompleted;
}
