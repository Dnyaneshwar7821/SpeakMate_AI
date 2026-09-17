package com.rslsolution.speakmateai.dto.groq;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload for the Groq chat completions endpoint.
 * Supports the OpenAI-compatible {@code response_format} (JSON mode) used by
 * the SpeakMate AI assistant's two-call pipeline (intent classifier + answer synthesizer).
 */
@Data
@NoArgsConstructor
public class GroqChatRequest {

	private String model;

	private List<Message> messages;

	private double temperature;

	@JsonProperty("response_format")
	private Map<String, Object> responseFormat;

	public GroqChatRequest(String model, List<Message> messages, double temperature, Map<String, Object> responseFormat) {
		this.model = model;
		this.messages = messages;
		this.temperature = temperature;
		this.responseFormat = responseFormat;
	}

	public String getModel() { return model; }
	public void setModel(String model) { this.model = model; }

	public List<Message> getMessages() { return messages; }
	public void setMessages(List<Message> messages) { this.messages = messages; }

	public double getTemperature() { return temperature; }
	public void setTemperature(double temperature) { this.temperature = temperature; }

	public Map<String, Object> getResponseFormat() { return responseFormat; }
	public void setResponseFormat(Map<String, Object> responseFormat) { this.responseFormat = responseFormat; }

	@Data
	@NoArgsConstructor
	public static class Message {

		private String role;
		private String content;

		public Message(String role, String content) {
			this.role = role;
			this.content = content;
		}

		public String getRole() { return role; }
		public void setRole(String role) { this.role = role; }

		public String getContent() { return content; }
		public void setContent(String content) { this.content = content; }
	}
}
