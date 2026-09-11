package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeachingOverviewResponse {
	private Integer totalClasses;
	private Integer totalStudents;
	private Integer totalLessonsAssigned;
	private Double averageClassPerformance;
	private java.util.List<AssignedClassResponse> assignedClasses;
}
