package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultRequest {

	@NotNull(message = "Student ID is required")
	private Long studentId;

	@NotBlank(message = "Test title is required")
	private String testTitle;

	@NotNull(message = "Marks obtained is required")
	@Min(value = 0, message = "Marks obtained must be >= 0")
	private Double marksObtained;

	@NotNull(message = "Total marks is required")
	@Min(value = 1, message = "Total marks must be >= 1")
	private Double totalMarks;

	private Boolean active;
}
