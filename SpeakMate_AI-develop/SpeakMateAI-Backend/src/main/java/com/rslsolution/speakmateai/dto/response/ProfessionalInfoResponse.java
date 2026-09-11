package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfessionalInfoResponse {
	private String employeeId;
	private String department;
	private String designation;
	private String qualification;
	private String experience;
	private LocalDateTime joinedAt;
	private String bio;
}
