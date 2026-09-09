package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassPerformanceResponse {
	private Long classId;
	private String className;
	private String grade;
	private Integer totalStudents;
	private Double averageProgress;
	private Double averageScore;
	private Integer completedLessons;
	private Integer activeStudents;
}
