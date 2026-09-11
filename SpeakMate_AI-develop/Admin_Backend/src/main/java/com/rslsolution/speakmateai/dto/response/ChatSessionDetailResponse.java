package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSessionDetailResponse {

	private Long id;
	private String mode;
	private String title;
	private LocalDateTime createdAt;
	private List<ChatMessageResponse> messages;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getMode() { return mode; }
	public void setMode(String mode) { this.mode = mode; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public List<ChatMessageResponse> getMessages() { return messages; }
	public void setMessages(List<ChatMessageResponse> messages) { this.messages = messages; }

	public static ChatSessionDetailResponseBuilder builder() {
		return new ChatSessionDetailResponseBuilder();
	}

	public static class ChatSessionDetailResponseBuilder {
		private Long id;
		private String mode;
		private String title;
		private LocalDateTime createdAt;
		private List<ChatMessageResponse> messages;

		public ChatSessionDetailResponseBuilder id(Long id) { this.id = id; return this; }
		public ChatSessionDetailResponseBuilder mode(String mode) { this.mode = mode; return this; }
		public ChatSessionDetailResponseBuilder title(String title) { this.title = title; return this; }
		public ChatSessionDetailResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public ChatSessionDetailResponseBuilder messages(List<ChatMessageResponse> messages) { this.messages = messages; return this; }

		public ChatSessionDetailResponse build() {
            ChatSessionDetailResponse obj = new ChatSessionDetailResponse();
            obj.setId(id);
            obj.setMode(mode);
            obj.setTitle(title);
            obj.setCreatedAt(createdAt);
            obj.setMessages(messages);
            return obj;
        }
	}
}
