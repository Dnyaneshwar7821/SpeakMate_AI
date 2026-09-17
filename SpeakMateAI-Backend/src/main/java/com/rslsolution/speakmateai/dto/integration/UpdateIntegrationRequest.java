package com.rslsolution.speakmateai.dto.integration;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateIntegrationRequest {
	private String status;
	private String mode;
	private Map<String, Object> config;
}
