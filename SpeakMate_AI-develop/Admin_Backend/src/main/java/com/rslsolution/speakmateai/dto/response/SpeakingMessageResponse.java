package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingMessageResponse {

	private String aiReply;

	// Tutor correction feedback
	private String grammarCorrection;
	private String betterSentence;
	private String vocabularySuggestions;
	private String explanation;
	private String followUpQuestion;

	public String getAiReply() { return aiReply; }
	public void setAiReply(String aiReply) { this.aiReply = aiReply; }

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

	public static SpeakingMessageResponseBuilder builder() {
		return new SpeakingMessageResponseBuilder();
	}

	public static class SpeakingMessageResponseBuilder {
		private String aiReply;
		private String grammarCorrection;
		private String betterSentence;
		private String vocabularySuggestions;
		private String explanation;
		private String followUpQuestion;

		public SpeakingMessageResponseBuilder aiReply(String aiReply) { this.aiReply = aiReply; return this; }
		public SpeakingMessageResponseBuilder grammarCorrection(String grammarCorrection) { this.grammarCorrection = grammarCorrection; return this; }
		public SpeakingMessageResponseBuilder betterSentence(String betterSentence) { this.betterSentence = betterSentence; return this; }
		public SpeakingMessageResponseBuilder vocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; return this; }
		public SpeakingMessageResponseBuilder explanation(String explanation) { this.explanation = explanation; return this; }
		public SpeakingMessageResponseBuilder followUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; return this; }

		public SpeakingMessageResponse build() {
            SpeakingMessageResponse obj = new SpeakingMessageResponse();
            obj.setAiReply(aiReply);
            obj.setGrammarCorrection(grammarCorrection);
            obj.setBetterSentence(betterSentence);
            obj.setVocabularySuggestions(vocabularySuggestions);
            obj.setExplanation(explanation);
            obj.setFollowUpQuestion(followUpQuestion);
            return obj;
        }
	}
}
