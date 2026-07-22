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
}
