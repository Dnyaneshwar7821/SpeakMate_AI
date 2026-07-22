package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSessionResponse {

	private Long id;

	private String topic;

	private String transcript;

	private Integer duration;

	private Double pronunciationScore;

	private Double fluencyScore;

	private Double grammarScore;

	private Double vocabularyScore;

	private Double overallScore;

	private String feedback;

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getTranscript() { return transcript; }
	public void setTranscript(String transcript) { this.transcript = transcript; }

	public Integer getDuration() { return duration; }
	public void setDuration(Integer duration) { this.duration = duration; }

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

	public static SpeakingSessionResponseBuilder builder() {
		return new SpeakingSessionResponseBuilder();
	}

	public static class SpeakingSessionResponseBuilder {
		private Long id;
		private String topic;
		private String transcript;
		private Integer duration;
		private Double pronunciationScore;
		private Double fluencyScore;
		private Double grammarScore;
		private Double vocabularyScore;
		private Double overallScore;
		private String feedback;
		private LocalDateTime createdAt;

		public SpeakingSessionResponseBuilder id(Long id) { this.id = id; return this; }
		public SpeakingSessionResponseBuilder topic(String topic) { this.topic = topic; return this; }
		public SpeakingSessionResponseBuilder transcript(String transcript) { this.transcript = transcript; return this; }
		public SpeakingSessionResponseBuilder duration(Integer duration) { this.duration = duration; return this; }
		public SpeakingSessionResponseBuilder pronunciationScore(Double pronunciationScore) { this.pronunciationScore = pronunciationScore; return this; }
		public SpeakingSessionResponseBuilder fluencyScore(Double fluencyScore) { this.fluencyScore = fluencyScore; return this; }
		public SpeakingSessionResponseBuilder grammarScore(Double grammarScore) { this.grammarScore = grammarScore; return this; }
		public SpeakingSessionResponseBuilder vocabularyScore(Double vocabularyScore) { this.vocabularyScore = vocabularyScore; return this; }
		public SpeakingSessionResponseBuilder overallScore(Double overallScore) { this.overallScore = overallScore; return this; }
		public SpeakingSessionResponseBuilder feedback(String feedback) { this.feedback = feedback; return this; }
		public SpeakingSessionResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public SpeakingSessionResponse build() {
			return new SpeakingSessionResponse(id, topic, transcript, duration, pronunciationScore, fluencyScore, grammarScore, vocabularyScore, overallScore, feedback, createdAt);
		}
	}
}