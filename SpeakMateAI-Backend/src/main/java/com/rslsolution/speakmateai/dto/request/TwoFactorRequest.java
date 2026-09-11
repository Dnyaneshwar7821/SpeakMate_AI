package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TwoFactorRequest {

	@NotNull(message = "Two factor enabled status is required")
	private Boolean enabled;
}
