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

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public ChatSession getSession() { return session; }
	public void setSession(ChatSession session) { this.session = session; }

	public String getSender() { return sender; }
	public void setSender(String sender) { this.sender = sender; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public boolean isVoiceEnabled() { return voiceEnabled; }
	public void setVoiceEnabled(boolean voiceEnabled) { this.voiceEnabled = voiceEnabled; }

	public String getGrammarCorrection() { return grammarCorrection; }
	public void setGrammarCorrection(String grammarCorrection) { this.grammarCorrection = grammarCorrection; }

	public String getBetterSentence() { return betterSentence; }
	public void setBetterSentence(String betterSentence) { this.betterSentence = betterSentence; }

	public String getVocabularySuggestions() { return vocabularySuggestions; }
	public void setVocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; }

	public String getExplanation() { return explanation; }
	public void setExplanation(String explanation) { this.explanation = explanation; }

	public String getFollowUpQuestion() { return followUpQuestion; }
	public void setFollowUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static ChatMessageBuilder builder() {
		return new ChatMessageBuilder();
	}

	public static class ChatMessageBuilder {
		private Long id;
		private ChatSession session;
		private String sender;
		private String message;
		private boolean voiceEnabled;
		private String grammarCorrection;
		private String betterSentence;
		private String vocabularySuggestions;
		private String explanation;
		private String followUpQuestion;
		private LocalDateTime createdAt;

		public ChatMessageBuilder id(Long id) { this.id = id; return this; }
		public ChatMessageBuilder session(ChatSession session) { this.session = session; return this; }
		public ChatMessageBuilder sender(String sender) { this.sender = sender; return this; }
		public ChatMessageBuilder message(String message) { this.message = message; return this; }
		public ChatMessageBuilder voiceEnabled(boolean voiceEnabled) { this.voiceEnabled = voiceEnabled; return this; }
		public ChatMessageBuilder grammarCorrection(String grammarCorrection) { this.grammarCorrection = grammarCorrection; return this; }
		public ChatMessageBuilder betterSentence(String betterSentence) { this.betterSentence = betterSentence; return this; }
		public ChatMessageBuilder vocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; return this; }
		public ChatMessageBuilder explanation(String explanation) { this.explanation = explanation; return this; }
		public ChatMessageBuilder followUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; return this; }
		public ChatMessageBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public ChatMessage build() {
			return new ChatMessage(id, session, sender, message, voiceEnabled, grammarCorrection, betterSentence, vocabularySuggestions, explanation, followUpQuestion, createdAt);
		}
	}
}
