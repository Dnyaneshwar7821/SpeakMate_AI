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
public class RecentReportResponse {
	private String id;
	private String title;
	private String type;
	private String status;
	private LocalDateTime generatedAt;
	private String downloadUrl;
}
