package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "session_id", nullable = false)
	private ChatSession session;

	@Column(nullable = false)
	private String sender; // "user" or "ai"

	@Column(columnDefinition = "TEXT", nullable = false)
	private String message;

	@Column(nullable = false)
	private boolean voiceEnabled;

	// Evaluation fields for AI messages
	@Column(columnDefinition = "TEXT")
	private String grammarCorrection;

	@Column(columnDefinition = "TEXT")
	private String betterSentence;

	@Column(columnDefinition = "TEXT")
	private String vocabularySuggestions;

	@Column(columnDefinition = "TEXT")
	private String explanation;

	@Column(columnDefinition = "TEXT")
	private String followUpQuestion;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}
}
