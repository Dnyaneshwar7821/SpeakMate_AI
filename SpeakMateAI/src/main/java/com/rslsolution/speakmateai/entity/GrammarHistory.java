package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "grammar_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrammarHistory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(columnDefinition = "TEXT", nullable = false)
	private String originalText;

	@Column(columnDefinition = "TEXT")
	private String correctedText;

	@Column(columnDefinition = "TEXT")
	private String explanation;

	private Double grammarScore;

	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@PrePersist
	public void onCreate() {
		createdAt = LocalDateTime.now();
	}

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public User getUser() { return user; }
	public void setUser(User user) { this.user = user; }

	public String getOriginalText() { return originalText; }
	public void setOriginalText(String originalText) { this.originalText = originalText; }

	public String getCorrectedText() { return correctedText; }
	public void setCorrectedText(String correctedText) { this.correctedText = correctedText; }

	public String getExplanation() { return explanation; }
	public void setExplanation(String explanation) { this.explanation = explanation; }

	public Double getGrammarScore() { return grammarScore; }
	public void setGrammarScore(Double grammarScore) { this.grammarScore = grammarScore; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static GrammarHistoryBuilder builder() {
		return new GrammarHistoryBuilder();
	}

	public static class GrammarHistoryBuilder {
		private Long id;
		private User user;
		private String originalText;
		private String correctedText;
		private String explanation;
		private Double grammarScore;
		private LocalDateTime createdAt;

		public GrammarHistoryBuilder id(Long id) { this.id = id; return this; }
		public GrammarHistoryBuilder user(User user) { this.user = user; return this; }
		public GrammarHistoryBuilder originalText(String originalText) { this.originalText = originalText; return this; }
		public GrammarHistoryBuilder correctedText(String correctedText) { this.correctedText = correctedText; return this; }
		public GrammarHistoryBuilder explanation(String explanation) { this.explanation = explanation; return this; }
		public GrammarHistoryBuilder grammarScore(Double grammarScore) { this.grammarScore = grammarScore; return this; }
		public GrammarHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public GrammarHistory build() {
            GrammarHistory obj = new GrammarHistory();
            obj.setId(id);
            obj.setUser(user);
            obj.setOriginalText(originalText);
            obj.setCorrectedText(correctedText);
            obj.setExplanation(explanation);
            obj.setGrammarScore(grammarScore);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}