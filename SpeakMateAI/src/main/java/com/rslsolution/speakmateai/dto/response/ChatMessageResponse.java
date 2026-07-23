package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

	private Long id;
	private String sender;
	private String message;
	private boolean voiceEnabled;
	private String grammarCorrection;
	private String betterSentence;
	private String vocabularySuggestions;
	private String explanation;
	private String followUpQuestion;
	private boolean bookmarked;
	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

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

	public boolean isBookmarked() { return bookmarked; }
	public void setBookmarked(boolean bookmarked) { this.bookmarked = bookmarked; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static ChatMessageResponseBuilder builder() {
		return new ChatMessageResponseBuilder();
	}

	public static class ChatMessageResponseBuilder {
		private Long id;
		private String sender;
		private String message;
		private boolean voiceEnabled;
		private String grammarCorrection;
		private String betterSentence;
		private String vocabularySuggestions;
		private String explanation;
		private String followUpQuestion;
		private boolean bookmarked;
		private LocalDateTime createdAt;

		public ChatMessageResponseBuilder id(Long id) { this.id = id; return this; }
		public ChatMessageResponseBuilder sender(String sender) { this.sender = sender; return this; }
		public ChatMessageResponseBuilder message(String message) { this.message = message; return this; }
		public ChatMessageResponseBuilder voiceEnabled(boolean voiceEnabled) { this.voiceEnabled = voiceEnabled; return this; }
		public ChatMessageResponseBuilder grammarCorrection(String grammarCorrection) { this.grammarCorrection = grammarCorrection; return this; }
		public ChatMessageResponseBuilder betterSentence(String betterSentence) { this.betterSentence = betterSentence; return this; }
		public ChatMessageResponseBuilder vocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; return this; }
		public ChatMessageResponseBuilder explanation(String explanation) { this.explanation = explanation; return this; }
		public ChatMessageResponseBuilder followUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; return this; }
		public ChatMessageResponseBuilder bookmarked(boolean bookmarked) { this.bookmarked = bookmarked; return this; }
		public ChatMessageResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public ChatMessageResponse build() {
            ChatMessageResponse obj = new ChatMessageResponse();
            obj.setId(id);
            obj.setSender(sender);
            obj.setMessage(message);
            obj.setVoiceEnabled(voiceEnabled);
            obj.setGrammarCorrection(grammarCorrection);
            obj.setBetterSentence(betterSentence);
            obj.setVocabularySuggestions(vocabularySuggestions);
            obj.setExplanation(explanation);
            obj.setFollowUpQuestion(followUpQuestion);
            obj.setBookmarked(bookmarked);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}
