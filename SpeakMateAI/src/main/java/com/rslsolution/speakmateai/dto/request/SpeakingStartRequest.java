package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingStartRequest {

	@NotBlank(message = "Scenario is required")
	private String scenario;

	private String difficulty; // Beginner / Intermediate / Advanced

	private Integer estimatedDuration; // in minutes

	private Integer xpReward;
}
