package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.Status;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultResponse {

	private Long id;
	private Long studentId;
	private String studentName;
	private String standard;
	private String testTitle;
	private Double marksObtained;
	private Double totalMarks;
	private Double percentage;
	private String status;
	private LocalDateTime submittedAt;
	private LocalDateTime createdAt;
}
