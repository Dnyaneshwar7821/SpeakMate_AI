package com.rslsolution.speakmateai.dto.groq;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroqRequest {

	private String model;
	private List<Message> messages;
	private double temperature;

	public GroqRequest(String model, List<Message> messages, double temperature) {
		this.model = model;
		this.messages = messages;
		this.temperature = temperature;
	}

	public String getModel() { return model; }
	public void setModel(String model) { this.model = model; }

	public List<Message> getMessages() { return messages; }
	public void setMessages(List<Message> messages) { this.messages = messages; }

	public double getTemperature() { return temperature; }
	public void setTemperature(double temperature) { this.temperature = temperature; }

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
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