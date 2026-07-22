package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WordOfTheDayResponse {

	private String word;
	private String meaning;
	private String exampleSentence;
	private String synonym;
	private String antonym;

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

	public static WordOfTheDayResponseBuilder builder() {
		return new WordOfTheDayResponseBuilder();
	}

	public static class WordOfTheDayResponseBuilder {
		private String word;
		private String meaning;
		private String exampleSentence;
		private String synonym;
		private String antonym;

		public WordOfTheDayResponseBuilder word(String word) { this.word = word; return this; }
		public WordOfTheDayResponseBuilder meaning(String meaning) { this.meaning = meaning; return this; }
		public WordOfTheDayResponseBuilder exampleSentence(String exampleSentence) { this.exampleSentence = exampleSentence; return this; }
		public WordOfTheDayResponseBuilder synonym(String synonym) { this.synonym = synonym; return this; }
		public WordOfTheDayResponseBuilder antonym(String antonym) { this.antonym = antonym; return this; }

		public WordOfTheDayResponse build() {
			return new WordOfTheDayResponse(word, meaning, exampleSentence, synonym, antonym);
		}
	}
}
