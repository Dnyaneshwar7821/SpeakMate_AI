package com.rslsolution.speakmateai.dto.integration;

import java.time.LocalDateTime;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntegrationResponse {
	private String id;
	private String name;
	private String category;
	private String badge;
	private String status;
	private String mode;
	private String lastSync;
	private LocalDateTime lastTestedAt;
	private Map<String, Object> config;
}
