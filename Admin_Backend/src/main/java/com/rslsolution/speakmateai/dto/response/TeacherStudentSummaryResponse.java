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
public class TeacherStudentSummaryResponse {
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String rollNumber;
	private Double overallProgress;
	private Double grammarScore;
	private Double vocabularyScore;
	private Double speakingScore;
	private Double listeningScore;
	private LocalDateTime lastActive;
	private Status status;
	private String standard;
	private String division;
}
