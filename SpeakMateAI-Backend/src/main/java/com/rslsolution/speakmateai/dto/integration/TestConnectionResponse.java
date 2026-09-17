package com.rslsolution.speakmateai.dto.integration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestConnectionResponse {
	private boolean success;
	private String message;
	private Long latencyMs;
	private String provider;
	private String details;
}
