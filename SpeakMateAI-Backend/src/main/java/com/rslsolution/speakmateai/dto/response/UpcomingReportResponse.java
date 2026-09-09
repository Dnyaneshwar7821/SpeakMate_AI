package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpcomingReportResponse {
	private String id;
	private String title;
	private String type;
	private LocalDate dueDate;
	private String status;
}
