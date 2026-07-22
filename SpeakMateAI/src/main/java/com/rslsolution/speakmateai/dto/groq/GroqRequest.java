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
	}
}