package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "conversation_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "session_id", nullable = false)
	private SpeakingSession session;

	// sender: "user" or "ai"
	@Column(nullable = false)
	private String sender;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String message;

	@Column(nullable = false)
	private LocalDateTime timestamp;

	@PrePersist
	public void onCreate() {
		timestamp = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public SpeakingSession getSession() { return session; }
	public void setSession(SpeakingSession session) { this.session = session; }

	public String getSender() { return sender; }
	public void setSender(String sender) { this.sender = sender; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public LocalDateTime getTimestamp() { return timestamp; }
	public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

	public static ConversationMessageBuilder builder() {
		return new ConversationMessageBuilder();
	}

	public static class ConversationMessageBuilder {
		private Long id;
		private SpeakingSession session;
		private String sender;
		private String message;
		private LocalDateTime timestamp;

		public ConversationMessageBuilder id(Long id) { this.id = id; return this; }
		public ConversationMessageBuilder session(SpeakingSession session) { this.session = session; return this; }
		public ConversationMessageBuilder sender(String sender) { this.sender = sender; return this; }
		public ConversationMessageBuilder message(String message) { this.message = message; return this; }
		public ConversationMessageBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

		public ConversationMessage build() {
            ConversationMessage obj = new ConversationMessage();
            obj.setId(id);
            obj.setSession(session);
            obj.setSender(sender);
            obj.setMessage(message);
            obj.setTimestamp(timestamp);
            return obj;
        }
	}
}
