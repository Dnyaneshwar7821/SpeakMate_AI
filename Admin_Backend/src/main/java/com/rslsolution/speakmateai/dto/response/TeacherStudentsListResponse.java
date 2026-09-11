package com.rslsolution.speakmateai.dto.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherStudentsListResponse {
	private List<AssignedClassResponse> assignedClasses;
	private List<String> assignedStandards;
	private List<String> assignedDivisions;
	private Integer totalStudents;
	private List<TeacherStudentSummaryResponse> students;
}
