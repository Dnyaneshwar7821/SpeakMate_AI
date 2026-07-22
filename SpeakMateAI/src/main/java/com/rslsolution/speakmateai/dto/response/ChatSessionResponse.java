package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionResponse {

	private Long id;
	private String mode;
	private String title;
	private int messageCount;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getMode() { return mode; }
	public void setMode(String mode) { this.mode = mode; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public int getMessageCount() { return messageCount; }
	public void setMessageCount(int messageCount) { this.messageCount = messageCount; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static ChatSessionResponseBuilder builder() {
		return new ChatSessionResponseBuilder();
	}

	public static class ChatSessionResponseBuilder {
		private Long id;
		private String mode;
		private String title;
		private int messageCount;
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public ChatSessionResponseBuilder id(Long id) { this.id = id; return this; }
		public ChatSessionResponseBuilder mode(String mode) { this.mode = mode; return this; }
		public ChatSessionResponseBuilder title(String title) { this.title = title; return this; }
		public ChatSessionResponseBuilder messageCount(int messageCount) { this.messageCount = messageCount; return this; }
		public ChatSessionResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public ChatSessionResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public ChatSessionResponse build() {
			return new ChatSessionResponse(id, mode, title, messageCount, createdAt, updatedAt);
		}
	}
}
