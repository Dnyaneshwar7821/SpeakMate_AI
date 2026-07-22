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
public class PronunciationRequest {

	@NotBlank(message = "Text is required")
	private String text;

	public String getText() { return text; }
	public void setText(String text) { this.text = text; }

	public static PronunciationRequestBuilder builder() {
		return new PronunciationRequestBuilder();
	}

	public static class PronunciationRequestBuilder {
		private String text;

		public PronunciationRequestBuilder text(String text) { this.text = text; return this; }

		public PronunciationRequest build() {
			return new PronunciationRequest(text);
		}
	}
}