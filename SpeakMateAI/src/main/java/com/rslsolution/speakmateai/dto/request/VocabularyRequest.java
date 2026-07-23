package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyRequest {

	@NotBlank(message = "Word is required")
	private String word;

	public String getWord() { return word; }
	public void setWord(String word) { this.word = word; }

	public static VocabularyRequestBuilder builder() {
		return new VocabularyRequestBuilder();
	}

	public static class VocabularyRequestBuilder {
		private String word;

		public VocabularyRequestBuilder word(String word) { this.word = word; return this; }

		public VocabularyRequest build() {
			return new VocabularyRequest(word);
		}
	}
}