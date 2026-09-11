package com.rslsolution.speakmateai.dto.request;

import com.rslsolution.speakmateai.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRoomRequest {
	private Long schoolId;
	private String name;
	private String grade;
	private String academicYear;
	private Long teacherId;
	private Status status;
}
