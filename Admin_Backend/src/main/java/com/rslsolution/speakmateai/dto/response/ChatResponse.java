package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatResponse {

	private Long id;

	private String userMessage;

	private String aiResponse;

	private String conversationId;

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getUserMessage() { return userMessage; }
	public void setUserMessage(String userMessage) { this.userMessage = userMessage; }

	public String getAiResponse() { return aiResponse; }
	public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

	public String getConversationId() { return conversationId; }
	public void setConversationId(String conversationId) { this.conversationId = conversationId; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static ChatResponseBuilder builder() {
		return new ChatResponseBuilder();
	}

	public static class ChatResponseBuilder {
		private Long id;
		private String userMessage;
		private String aiResponse;
		private String conversationId;
		private LocalDateTime createdAt;

		public ChatResponseBuilder id(Long id) { this.id = id; return this; }
		public ChatResponseBuilder userMessage(String userMessage) { this.userMessage = userMessage; return this; }
		public ChatResponseBuilder aiResponse(String aiResponse) { this.aiResponse = aiResponse; return this; }
		public ChatResponseBuilder conversationId(String conversationId) { this.conversationId = conversationId; return this; }
		public ChatResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public ChatResponse build() {
            ChatResponse obj = new ChatResponse();
            obj.setId(id);
            obj.setUserMessage(userMessage);
            obj.setAiResponse(aiResponse);
            obj.setConversationId(conversationId);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}