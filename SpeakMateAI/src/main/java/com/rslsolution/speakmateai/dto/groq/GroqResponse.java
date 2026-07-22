package com.rslsolution.speakmateai.dto.groq;

import java.util.List;

import lombok.Data;

@Data
public class GroqResponse {

	private String id;
	private String object;
	private Long created;
	private String model;

	private List<Choice> choices;

	@Data
	public static class Choice {

		private int index;
		private Message message;
		private String finish_reason;
	}

	@Data
	public static class Message {

		private String role;
		private String content;
	}
}