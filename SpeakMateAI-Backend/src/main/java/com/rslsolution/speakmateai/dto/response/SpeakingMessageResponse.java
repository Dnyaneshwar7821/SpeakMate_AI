package com.rslsolution.speakmateai.dto.response;

import java.util.List;
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

	// Tutor correction feedback & Native guidance
	private String grammarCorrection;
	private String betterSentence; // "How to say it"
	private String vocabularySuggestions;
	private String explanation;
	private String followUpQuestion;
	private String nativeTip;
	private List<String> suggestedResponses; // 2-3 interactive response prompts

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

	public String getNativeTip() { return nativeTip; }
	public void setNativeTip(String nativeTip) { this.nativeTip = nativeTip; }

	public List<String> getSuggestedResponses() { return suggestedResponses; }
	public void setSuggestedResponses(List<String> suggestedResponses) { this.suggestedResponses = suggestedResponses; }

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
		private String nativeTip;
		private List<String> suggestedResponses;

		public SpeakingMessageResponseBuilder aiReply(String aiReply) { this.aiReply = aiReply; return this; }
		public SpeakingMessageResponseBuilder grammarCorrection(String grammarCorrection) { this.grammarCorrection = grammarCorrection; return this; }
		public SpeakingMessageResponseBuilder betterSentence(String betterSentence) { this.betterSentence = betterSentence; return this; }
		public SpeakingMessageResponseBuilder vocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; return this; }
		public SpeakingMessageResponseBuilder explanation(String explanation) { this.explanation = explanation; return this; }
		public SpeakingMessageResponseBuilder followUpQuestion(String followUpQuestion) { this.followUpQuestion = followUpQuestion; return this; }
		public SpeakingMessageResponseBuilder nativeTip(String nativeTip) { this.nativeTip = nativeTip; return this; }
		public SpeakingMessageResponseBuilder suggestedResponses(List<String> suggestedResponses) { this.suggestedResponses = suggestedResponses; return this; }

		public SpeakingMessageResponse build() {
            SpeakingMessageResponse obj = new SpeakingMessageResponse();
            obj.setAiReply(aiReply);
            obj.setGrammarCorrection(grammarCorrection);
            obj.setBetterSentence(betterSentence);
            obj.setVocabularySuggestions(vocabularySuggestions);
            obj.setExplanation(explanation);
            obj.setFollowUpQuestion(followUpQuestion);
            obj.setNativeTip(nativeTip);
            obj.setSuggestedResponses(suggestedResponses);
            return obj;
        }
	}
}
