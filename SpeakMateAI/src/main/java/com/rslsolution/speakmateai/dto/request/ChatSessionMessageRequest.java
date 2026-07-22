package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSessionMessageRequest {

	@NotNull(message = "Session ID is required")
	private Long sessionId;

	@NotBlank(message = "Message is required")
	private String message;

	private boolean voiceEnabled;

	private String level;

}
