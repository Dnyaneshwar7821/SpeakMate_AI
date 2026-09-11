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

	public Long getSessionId() { return sessionId; }
	public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public boolean isVoiceEnabled() { return voiceEnabled; }
	public void setVoiceEnabled(boolean voiceEnabled) { this.voiceEnabled = voiceEnabled; }

	public String getLevel() { return level; }
	public void setLevel(String level) { this.level = level; }

}
