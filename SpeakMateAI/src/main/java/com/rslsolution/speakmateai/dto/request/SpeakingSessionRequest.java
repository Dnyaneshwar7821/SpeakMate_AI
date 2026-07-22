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
public class SpeakingSessionRequest {

	@NotBlank(message = "Topic is required")
	private String topic;

	@NotBlank(message = "Transcript is required")
	private String transcript;

	@NotNull(message = "Duration is required")
	@Min(value = 1, message = "Duration must be greater than 0")
	private Integer duration;

}