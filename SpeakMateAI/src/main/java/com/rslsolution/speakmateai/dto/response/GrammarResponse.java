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
public class GrammarResponse {

	private Long id;

	private String originalText;

	private String correctedText;

	private String explanation;

	private Double grammarScore;

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

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

	public static GrammarResponseBuilder builder() {
		return new GrammarResponseBuilder();
	}

	public static class GrammarResponseBuilder {
		private Long id;
		private String originalText;
		private String correctedText;
		private String explanation;
		private Double grammarScore;
		private LocalDateTime createdAt;

		public GrammarResponseBuilder id(Long id) { this.id = id; return this; }
		public GrammarResponseBuilder originalText(String originalText) { this.originalText = originalText; return this; }
		public GrammarResponseBuilder correctedText(String correctedText) { this.correctedText = correctedText; return this; }
		public GrammarResponseBuilder explanation(String explanation) { this.explanation = explanation; return this; }
		public GrammarResponseBuilder grammarScore(Double grammarScore) { this.grammarScore = grammarScore; return this; }
		public GrammarResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public GrammarResponse build() {
            GrammarResponse obj = new GrammarResponse();
            obj.setId(id);
            obj.setOriginalText(originalText);
            obj.setCorrectedText(correctedText);
            obj.setExplanation(explanation);
            obj.setGrammarScore(grammarScore);
            obj.setCreatedAt(createdAt);
            return obj;
        }
	}
}