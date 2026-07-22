package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatStartRequest {

	@NotBlank(message = "Mode is required")
	private String mode;

}
