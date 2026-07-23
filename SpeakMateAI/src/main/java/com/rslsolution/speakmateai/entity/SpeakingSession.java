package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "speaking_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingSession {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false)
	private String topic; // also acts as topic/scenario name

	// scenario name specifically
	private String scenario;

	@Column(columnDefinition = "TEXT", nullable = true)
	private String transcript;

	@Column(nullable = false)
	private Integer duration; // session duration in seconds or minutes

	@Builder.Default
	private Integer xpEarned = 0;

	@Builder.Default
	private Double score = 0.0;

	private Double pronunciationScore;
	private Double fluencyScore;
	private Double grammarScore;
	private Double vocabularyScore;
	private Double overallScore;

	@Column(columnDefinition = "TEXT")
	private String feedback;

	@Builder.Default
	@OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<ConversationMessage> messages = new ArrayList<>();

	@OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
	private ConversationFeedback sessionFeedback;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
		if (scenario == null) {
			scenario = topic;
		}
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getTopic() { return topic; }
	public void setTopic(String topic) { this.topic = topic; }

	public String getScenario() { return scenario; }
	public void setScenario(String scenario) { this.scenario = scenario; }

	public String getTranscript() { return transcript; }
	public void setTranscript(String transcript) { this.transcript = transcript; }

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

	public List<ConversationMessage> getMessages() { return messages; }
	public void setMessages(List<ConversationMessage> messages) { this.messages = messages; }

	public ConversationFeedback getSessionFeedback() { return sessionFeedback; }
	public void setSessionFeedback(ConversationFeedback sessionFeedback) { this.sessionFeedback = sessionFeedback; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static SpeakingSessionBuilder builder() {
		return new SpeakingSessionBuilder();
	}

	public static class SpeakingSessionBuilder {
		private Long id;
		private User user;
		private String topic;
		private String scenario;
		private String transcript;
		private Integer duration;
		private Integer xpEarned = 0;
		private Double score = 0.0;
		private Double pronunciationScore;
		private Double fluencyScore;
		private Double grammarScore;
		private Double vocabularyScore;
		private Double overallScore;
		private String feedback;
		private List<ConversationMessage> messages = new ArrayList<>();
		private ConversationFeedback sessionFeedback;
		private LocalDateTime createdAt;

		public SpeakingSessionBuilder id(Long id) { this.id = id; return this; }
		public SpeakingSessionBuilder user(User user) { this.user = user; return this; }
		public SpeakingSessionBuilder topic(String topic) { this.topic = topic; return this; }
		public SpeakingSessionBuilder scenario(String scenario) { this.scenario = scenario; return this; }
		public SpeakingSessionBuilder transcript(String transcript) { this.transcript = transcript; return this; }
		public SpeakingSessionBuilder duration(Integer duration) { this.duration = duration; return this; }
		public SpeakingSessionBuilder xpEarned(Integer xpEarned) { this.xpEarned = xpEarned; return this; }
		public SpeakingSessionBuilder score(Double score) { this.score = score; return this; }
		public SpeakingSessionBuilder pronunciationScore(Double pronunciationScore) { this.pronunciationScore = pronunciationScore; return this; }
		public SpeakingSessionBuilder fluencyScore(Double fluencyScore) { this.fluencyScore = fluencyScore; return this; }
		public SpeakingSessionBuilder grammarScore(Double grammarScore) { this.grammarScore = grammarScore; return this; }
		public SpeakingSessionBuilder vocabularyScore(Double vocabularyScore) { this.vocabularyScore = vocabularyScore; return this; }
		public SpeakingSessionBuilder overallScore(Double overallScore) { this.overallScore = overallScore; return this; }
		public SpeakingSessionBuilder feedback(String feedback) { this.feedback = feedback; return this; }
		public SpeakingSessionBuilder messages(List<ConversationMessage> messages) { this.messages = messages; return this; }
		public SpeakingSessionBuilder sessionFeedback(ConversationFeedback sessionFeedback) { this.sessionFeedback = sessionFeedback; return this; }
		public SpeakingSessionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public SpeakingSession build() {
            SpeakingSession obj = new SpeakingSession();
            obj.setId(id);
            obj.setUser(user);
            obj.setTopic(topic);
            obj.setScenario(scenario);
            obj.setTranscript(transcript);
            obj.setDuration(duration);
            obj.setXpEarned(xpEarned);
            obj.setScore(score);
            obj.setPronunciationScore(pronunciationScore);
            obj.setFluencyScore(fluencyScore);
            obj.setGrammarScore(grammarScore);
            obj.setVocabularyScore(vocabularyScore);
            obj.setOverallScore(overallScore);
            obj.setFeedback(feedback);
            obj.setMessages(messages);
            obj.setSessionFeedback(sessionFeedback);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}