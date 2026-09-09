package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSessionDetailResponse {

	private Long id;

	private String scenario;

	private Integer duration;

	private Integer xpEarned;

	private Double score;

	private Double pronunciationScore;

	private Double fluencyScore;

	private Double grammarScore;

	private Double vocabularyScore;

	private Double overallScore;

	private String feedback;

	private LocalDateTime createdAt;

	private List<MessageDto> messages;

	private FeedbackDto feedbackDetail;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

	public Integer getXpEarned() { return xpEarned; }
	public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }

	public Double getScore() { return score; }
	public void setScore(Double score) { this.score = score; }

	public Double getPronunciationScore() { return pronunciationScore; }
	public void setPronunciationScore(Double pronunciationScore) { this.pronunciationScore = pronunciationScore; }

	public Double getFluencyScore() { return fluencyScore; }
	public void setFluencyScore(Double fluencyScore) { this.fluencyScore = fluencyScore; }

	public Double getGrammarScore() { return grammarScore; }
	public void setGrammarScore(Double grammarScore) { this.grammarScore = grammarScore; }

	public Double getVocabularyScore() { return vocabularyScore; }
	public void setVocabularyScore(Double vocabularyScore) { this.vocabularyScore = vocabularyScore; }

	public Double getOverallScore() { return overallScore; }
	public void setOverallScore(Double overallScore) { this.overallScore = overallScore; }

	public String getFeedback() { return feedback; }
	public void setFeedback(String feedback) { this.feedback = feedback; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public List<MessageDto> getMessages() { return messages; }
	public void setMessages(List<MessageDto> messages) { this.messages = messages; }

	public FeedbackDto getFeedbackDetail() { return feedbackDetail; }
	public void setFeedbackDetail(FeedbackDto feedbackDetail) { this.feedbackDetail = feedbackDetail; }

	public static SpeakingSessionDetailResponseBuilder builder() {
		return new SpeakingSessionDetailResponseBuilder();
	}

	public static class SpeakingSessionDetailResponseBuilder {
		private Long id;
		private String scenario;
		private Integer duration;
		private Integer xpEarned;
		private Double score;
		private Double pronunciationScore;
		private Double fluencyScore;
		private Double grammarScore;
		private Double vocabularyScore;
		private Double overallScore;
		private String feedback;
		private LocalDateTime createdAt;
		private List<MessageDto> messages;
		private FeedbackDto feedbackDetail;

		public SpeakingSessionDetailResponseBuilder id(Long id) { this.id = id; return this; }
		public SpeakingSessionDetailResponseBuilder scenario(String scenario) { this.scenario = scenario; return this; }
		public SpeakingSessionDetailResponseBuilder duration(Integer duration) { this.duration = duration; return this; }
		public SpeakingSessionDetailResponseBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public SpeakingSessionDetailResponseBuilder score(Double score) { this.score = score; return this; }
		public SpeakingSessionDetailResponseBuilder pronunciationScore(Double pronunciationScore) { this.pronunciationScore = pronunciationScore; return this; }
		public SpeakingSessionDetailResponseBuilder fluencyScore(Double fluencyScore) { this.fluencyScore = fluencyScore; return this; }
		public SpeakingSessionDetailResponseBuilder grammarScore(Double grammarScore) { this.grammarScore = grammarScore; return this; }
		public SpeakingSessionDetailResponseBuilder vocabularyScore(Double vocabularyScore) { this.vocabularyScore = vocabularyScore; return this; }
		public SpeakingSessionDetailResponseBuilder overallScore(Double overallScore) { this.overallScore = overallScore; return this; }
		public SpeakingSessionDetailResponseBuilder feedback(String feedback) { this.feedback = feedback; return this; }
		public SpeakingSessionDetailResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
		public SpeakingSessionDetailResponseBuilder messages(List<MessageDto> messages) { this.messages = messages; return this; }
		public SpeakingSessionDetailResponseBuilder feedbackDetail(FeedbackDto feedbackDetail) { this.feedbackDetail = feedbackDetail; return this; }

		public SpeakingSessionDetailResponse build() {
            SpeakingSessionDetailResponse obj = new SpeakingSessionDetailResponse();
            obj.setId(id);
            obj.setScenario(scenario);
            obj.setDuration(duration);
            obj.setXpEarned(xpEarned);
            obj.setScore(score);
            obj.setPronunciationScore(pronunciationScore);
            obj.setFluencyScore(fluencyScore);
            obj.setGrammarScore(grammarScore);
            obj.setVocabularyScore(vocabularyScore);
            obj.setOverallScore(overallScore);
            obj.setFeedback(feedback);
            obj.setCreatedAt(createdAt);
            obj.setMessages(messages);
            obj.setFeedbackDetail(feedbackDetail);
            return obj;
        }
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class MessageDto {
		private Long id;
		private String sender;
		private String message;
		private LocalDateTime timestamp;

		public Long getId() { return id; }
		public void setId(Long id) { this.id = id; }

		public String getSender() { return sender; }
		public void setSender(String sender) { this.sender = sender; }

		public String getMessage() { return message; }
		public void setMessage(String message) { this.message = message; }

		public LocalDateTime getTimestamp() { return timestamp; }
		public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

		public static MessageDtoBuilder builder() {
			return new MessageDtoBuilder();
		}

		public static class MessageDtoBuilder {
			private Long id;
			private String sender;
			private String message;
			private LocalDateTime timestamp;

			public MessageDtoBuilder id(Long id) { this.id = id; return this; }
			public MessageDtoBuilder sender(String sender) { this.sender = sender; return this; }
			public MessageDtoBuilder message(String message) { this.message = message; return this; }
			public MessageDtoBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }

			public MessageDto build() {
            MessageDto obj = new MessageDto();
            obj.setId(id);
            obj.setSender(sender);
            obj.setMessage(message);
            obj.setTimestamp(timestamp);
            return obj;
        }
		}
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class FeedbackDto {
		private String grammarCorrections;
		private String betterSentences;
		private String vocabularySuggestions;
		private String summary;

		public String getGrammarCorrections() { return grammarCorrections; }
		public void setGrammarCorrections(String grammarCorrections) { this.grammarCorrections = grammarCorrections; }

		public String getBetterSentences() { return betterSentences; }
		public void setBetterSentences(String betterSentences) { this.betterSentences = betterSentences; }

		public String getVocabularySuggestions() { return vocabularySuggestions; }
		public void setVocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; }

		public String getSummary() { return summary; }
		public void setSummary(String summary) { this.summary = summary; }

		public static FeedbackDtoBuilder builder() {
			return new FeedbackDtoBuilder();
		}

		public static class FeedbackDtoBuilder {
			private String grammarCorrections;
			private String betterSentences;
			private String vocabularySuggestions;
			private String summary;

			public FeedbackDtoBuilder grammarCorrections(String grammarCorrections) { this.grammarCorrections = grammarCorrections; return this; }
			public FeedbackDtoBuilder betterSentences(String betterSentences) { this.betterSentences = betterSentences; return this; }
			public FeedbackDtoBuilder vocabularySuggestions(String vocabularySuggestions) { this.vocabularySuggestions = vocabularySuggestions; return this; }
			public FeedbackDtoBuilder summary(String summary) { this.summary = summary; return this; }

			public FeedbackDto build() {
            FeedbackDto obj = new FeedbackDto();
            obj.setGrammarCorrections(grammarCorrections);
            obj.setBetterSentences(betterSentences);
            obj.setVocabularySuggestions(vocabularySuggestions);
            obj.setSummary(summary);
            return obj;
        }
		}
	}
}
