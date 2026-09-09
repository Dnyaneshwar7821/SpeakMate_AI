package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String mode; // e.g., "General English", "Grammar Coach"

	@Column(nullable = false)
	private String title; // Renameable session title

	@Builder.Default
	@OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
	@OrderBy("createdAt ASC")
	private List<ChatMessage> messages = new ArrayList<>();

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		updatedAt = LocalDateTime.now();
	}

	@PreUpdate
	public void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getMode() { return mode; }
	public void setMode(String mode) { this.mode = mode; }

	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }

	public List<ChatMessage> getMessages() { return messages; }
	public void setMessages(List<ChatMessage> messages) { this.messages = messages; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public LocalDateTime getUpdatedAt() { return updatedAt; }
	public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

	public static ChatSessionBuilder builder() {
		return new ChatSessionBuilder();
	}

	public static class ChatSessionBuilder {
		private Long id;
		private User user;
		private String mode;
		private String title;
		private List<ChatMessage> messages = new ArrayList<>();
		private LocalDateTime createdAt;
		private LocalDateTime updatedAt;

		public ChatSessionBuilder id(Long id) { this.id = id; return this; }
		public ChatSessionBuilder user(User user) { this.user = user; return this; }
		public ChatSessionBuilder mode(String mode) { this.mode = mode; return this; }
		public ChatSessionBuilder title(String title) { this.title = title; return this; }
		public ChatSessionBuilder messages(List<ChatMessage> messages) { this.messages = messages; return this; }
		public ChatSessionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public ChatSessionBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

		public ChatSession build() {
            ChatSession obj = new ChatSession();
            obj.setId(id);
            obj.setUser(user);
            obj.setMode(mode);
            obj.setTitle(title);
            obj.setMessages(messages);
            obj.setCreatedAt(createdAt);
            obj.setUpdatedAt(updatedAt);
            return obj;
        }
	}
}
