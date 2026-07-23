package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_bookmarks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatBookmark {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "message_id", nullable = false)
	private ChatMessage message;

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

	public ChatMessage getMessage() { return message; }
	public void setMessage(ChatMessage message) { this.message = message; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static ChatBookmarkBuilder builder() {
		return new ChatBookmarkBuilder();
	}

	public static class ChatBookmarkBuilder {
		private Long id;
		private User user;
		private ChatMessage message;
		private LocalDateTime createdAt;

		public ChatBookmarkBuilder id(Long id) { this.id = id; return this; }
		public ChatBookmarkBuilder user(User user) { this.user = user; return this; }
		public ChatBookmarkBuilder message(ChatMessage message) { this.message = message; return this; }
		public ChatBookmarkBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public ChatBookmark build() {
			return new ChatBookmark(id, user, message, createdAt);
		}
	}
}
