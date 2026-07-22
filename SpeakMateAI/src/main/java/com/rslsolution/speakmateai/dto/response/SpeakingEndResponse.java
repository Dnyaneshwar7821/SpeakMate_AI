package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingEndResponse {

	private Long sessionId;
	private String scenario;
	private Integer duration; // in seconds
	private Integer messagesExchanged;
	private Integer grammarMistakes;
	private Integer xpEarned;
	private Double score; // heuristic score (0 - 100)
	private String summary;
	private String vocabularyLearned;
	private String motivationalMessage;

	public Long getSessionId() { return sessionId; }
	public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public Integer getMessagesExchanged() { return messagesExchanged; }
	public void setMessagesExchanged(Integer messagesExchanged) { this.messagesExchanged = messagesExchanged; }

	public Integer getGrammarMistakes() { return grammarMistakes; }
	public void setGrammarMistakes(Integer grammarMistakes) { this.grammarMistakes = grammarMistakes; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public Double getScore() { return score; }
	public void setScore(Double score) { this.score = score; }

	public String getSummary() { return summary; }
	public void setSummary(String summary) { this.summary = summary; }

	public String getVocabularyLearned() { return vocabularyLearned; }
	public void setVocabularyLearned(String vocabularyLearned) { this.vocabularyLearned = vocabularyLearned; }

	public String getMotivationalMessage() { return motivationalMessage; }
	public void setMotivationalMessage(String motivationalMessage) { this.motivationalMessage = motivationalMessage; }

	public static SpeakingEndResponseBuilder builder() {
		return new SpeakingEndResponseBuilder();
	}

	public static class SpeakingEndResponseBuilder {
		private Long sessionId;
		private String scenario;
		private Integer duration;
		private Integer messagesExchanged;
		private Integer grammarMistakes;
		private Integer xpEarned;
		private Double score;
		private String summary;
		private String vocabularyLearned;
		private String motivationalMessage;

		public SpeakingEndResponseBuilder sessionId(Long sessionId) { this.sessionId = sessionId; return this; }
		public SpeakingEndResponseBuilder scenario(String scenario) { this.scenario = scenario; return this; }
		public SpeakingEndResponseBuilder duration(Integer duration) { this.duration = duration; return this; }
		public SpeakingEndResponseBuilder messagesExchanged(Integer messagesExchanged) { this.messagesExchanged = messagesExchanged; return this; }
		public SpeakingEndResponseBuilder grammarMistakes(Integer grammarMistakes) { this.grammarMistakes = grammarMistakes; return this; }
		public SpeakingEndResponseBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public SpeakingEndResponseBuilder score(Double score) { this.score = score; return this; }
		public SpeakingEndResponseBuilder summary(String summary) { this.summary = summary; return this; }
		public SpeakingEndResponseBuilder vocabularyLearned(String vocabularyLearned) { this.vocabularyLearned = vocabularyLearned; return this; }
		public SpeakingEndResponseBuilder motivationalMessage(String motivationalMessage) { this.motivationalMessage = motivationalMessage; return this; }

		public SpeakingEndResponse build() {
			return new SpeakingEndResponse(sessionId, scenario, duration, messagesExchanged, grammarMistakes, xpEarned, score, summary, vocabularyLearned, motivationalMessage);
		}
	}
}
