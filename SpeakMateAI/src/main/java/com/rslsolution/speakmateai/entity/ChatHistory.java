package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "chat_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String userMessage;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String aiResponse;

	@Column(nullable = false)
	private String conversationId;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getUserMessage() { return userMessage; }
	public void setUserMessage(String userMessage) { this.userMessage = userMessage; }

	public String getAiResponse() { return aiResponse; }
	public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

	public String getConversationId() { return conversationId; }
	public void setConversationId(String conversationId) { this.conversationId = conversationId; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static ChatHistoryBuilder builder() {
		return new ChatHistoryBuilder();
	}

	public static class ChatHistoryBuilder {
		private Long id;
		private User user;
		private String userMessage;
		private String aiResponse;
		private String conversationId;
		private LocalDateTime createdAt;

		public ChatHistoryBuilder id(Long id) { this.id = id; return this; }
		public ChatHistoryBuilder user(User user) { this.user = user; return this; }
		public ChatHistoryBuilder userMessage(String userMessage) { this.userMessage = userMessage; return this; }
		public ChatHistoryBuilder aiResponse(String aiResponse) { this.aiResponse = aiResponse; return this; }
		public ChatHistoryBuilder conversationId(String conversationId) { this.conversationId = conversationId; return this; }
		public ChatHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public ChatHistory build() {
			return new ChatHistory(id, user, userMessage, aiResponse, conversationId, createdAt);
		}
	}
}