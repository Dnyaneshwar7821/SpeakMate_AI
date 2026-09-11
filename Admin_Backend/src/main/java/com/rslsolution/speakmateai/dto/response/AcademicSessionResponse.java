package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AcademicSessionResponse {
	private String name;
	private LocalDate startDate;
	private LocalDate endDate;
	private String currentTerm;
	private Integer totalWeeks;
	private Integer remainingWeeks;
}
