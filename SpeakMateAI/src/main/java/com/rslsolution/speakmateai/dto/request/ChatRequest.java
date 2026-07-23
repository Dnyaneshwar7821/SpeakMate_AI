package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {

	@NotBlank(message = "Message is required")
	private String message;

	@NotBlank(message = "Conversation ID is required")
	private String conversationId;

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public String getConversationId() { return conversationId; }
	public void setConversationId(String conversationId) { this.conversationId = conversationId; }

	public static ChatRequestBuilder builder() {
		return new ChatRequestBuilder();
	}

	public static class ChatRequestBuilder {
		private String message;
		private String conversationId;

		public ChatRequestBuilder message(String message) { this.message = message; return this; }
		public ChatRequestBuilder conversationId(String conversationId) { this.conversationId = conversationId; return this; }

		public ChatRequest build() {
            ChatRequest obj = new ChatRequest();
            obj.setMessage(message);
            obj.setConversationId(conversationId);
            return obj;
        }
	}
}