package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAnalyticsSummaryResponse {
	private Long studentId;
	private String studentName;
	private String rollNumber;
	private String standard;
	private String division;
	private Double overallProgress;
	private Double averageScore;
	private Double practiceCompletion;
	private Double attendance;
	private String status;
}
