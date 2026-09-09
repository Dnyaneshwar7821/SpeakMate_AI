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

	public String getId() { return id; }
	public void setId(String id) { this.id = id; }

	public String getObject() { return object; }
	public void setObject(String object) { this.object = object; }

	public Long getCreated() { return created; }
	public void setCreated(Long created) { this.created = created; }

	public String getModel() { return model; }
	public void setModel(String model) { this.model = model; }

	public List<Choice> getChoices() { return choices; }
	public void setChoices(List<Choice> choices) { this.choices = choices; }

	@Data
	public static class Choice {

		private int index;
		private Message message;
		private String finish_reason;

		public int getIndex() { return index; }
		public void setIndex(int index) { this.index = index; }

		public Message getMessage() { return message; }
		public void setMessage(Message message) { this.message = message; }

		public String getFinish_reason() { return finish_reason; }
		public void setFinish_reason(String finish_reason) { this.finish_reason = finish_reason; }
	}

	@Data
	public static class Message {

		private String role;
		private String content;

		public String getRole() { return role; }
		public void setRole(String role) { this.role = role; }

		public String getContent() { return content; }
		public void setContent(String content) { this.content = content; }
	}
}