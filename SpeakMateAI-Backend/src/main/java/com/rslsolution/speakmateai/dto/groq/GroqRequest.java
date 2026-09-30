package com.rslsolution.speakmateai.dto.groq;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class GroqRequest {

	private String model;
	private List<Message> messages;
	private double temperature;

	@JsonProperty("max_tokens")
	private Integer maxTokens = 250;

	public GroqRequest(String model, List<Message> messages, double temperature) {
		this.model = model;
		this.messages = messages;
		this.temperature = temperature;
		this.maxTokens = 250;
	}

	public GroqRequest(String model, List<Message> messages, double temperature, Integer maxTokens) {
		this.model = model;
		this.messages = messages;
		this.temperature = temperature;
		this.maxTokens = maxTokens != null ? maxTokens : 250;
	}

	public Integer getMaxTokens() { return maxTokens; }
	public void setMaxTokens(Integer maxTokens) { this.maxTokens = maxTokens; }

	public String getModel() { return model; }
	public void setModel(String model) { this.model = model; }

	public List<Message> getMessages() { return messages; }
	public void setMessages(List<Message> messages) { this.messages = messages; }

	public double getTemperature() { return temperature; }
	public void setTemperature(double temperature) { this.temperature = temperature; }

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