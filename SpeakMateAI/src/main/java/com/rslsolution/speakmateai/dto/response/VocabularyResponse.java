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
public class VocabularyResponse {

	private Long id;

	private String word;

	private String meaning;

	private String exampleSentence;

	private String synonym;

	private String antonym;

	private Boolean favorite;

	private LocalDateTime createdAt;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getWord() { return word; }
	public void setWord(String word) { this.word = word; }

	public String getMeaning() { return meaning; }
	public void setMeaning(String meaning) { this.meaning = meaning; }

	public String getExampleSentence() { return exampleSentence; }
	public void setExampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; }

	public String getSynonym() { return synonym; }
	public void setSynonym(String synonym) { this.synonym = synonym; }

	public String getAntonym() { return antonym; }
	public void setAntonym(String antonym) { this.antonym = antonym; }

	public Boolean getFavorite() { return favorite; }
	public void setFavorite(Boolean favorite) { this.favorite = favorite; }

	public LocalDateTime getCreatedAt() { return createdAt; }
	public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

	public static VocabularyResponseBuilder builder() {
		return new VocabularyResponseBuilder();
	}

	public static class VocabularyResponseBuilder {
		private Long id;
		private String word;
		private String meaning;
		private String exampleSentence;
		private String synonym;
		private String antonym;
		private Boolean favorite;
		private LocalDateTime createdAt;

		public VocabularyResponseBuilder id(Long id) { this.id = id; return this; }
		public VocabularyResponseBuilder word(String word) { this.word = word; return this; }
		public VocabularyResponseBuilder meaning(String meaning) { this.meaning = meaning; return this; }
		public VocabularyResponseBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
		public VocabularyResponseBuilder synonym(String synonym) { this.synonym = synonym; return this; }
		public VocabularyResponseBuilder antonym(String antonym) { this.antonym = antonym; return this; }
		public VocabularyResponseBuilder favorite(Boolean favorite) { this.favorite = favorite; return this; }
		public VocabularyResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

		public VocabularyResponse build() {
			return new VocabularyResponse(id, word, meaning, exampleSentence, synonym, antonym, favorite, createdAt);
		}
	}
}