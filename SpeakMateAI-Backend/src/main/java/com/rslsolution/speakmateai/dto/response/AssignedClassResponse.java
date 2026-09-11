package com.rslsolution.speakmateai.dto.response;

import com.rslsolution.speakmateai.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignedClassResponse {
	private Long id;
	private String name;
	private String grade;
	private String standard;
	private String division;
	private String academicYear;
	private Status status;
	private Integer studentCount;
}
