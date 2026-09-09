package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolDashboardResponse {

	private Long totalStudents;
	private Long activeStudents;
	private Long inactiveStudents;
	private Long totalTeachers;
	private Long totalClasses;
	private Long totalResults;
	private Double averageResultPercentage;
	private Long excellentResults;
	private Long goodResults;
	private Long passResults;
	private Long failResults;
	private Long totalLessonsCompleted;

	// School & Admin metadata
	private Long schoolId;
	private String schoolName;
	private String schoolCode;
	private String schoolAddress;
	private String adminName;
	private String adminEmail;
}
