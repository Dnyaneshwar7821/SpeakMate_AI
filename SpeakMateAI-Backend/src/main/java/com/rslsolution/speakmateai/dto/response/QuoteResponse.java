package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteResponse {

	private String text;

	private String author;

	public String getText() { return text; }
	public void setText(String text) { this.text = text; }

	public String getAuthor() { return author; }
	public void setAuthor(String author) { this.author = author; }

	public static QuoteResponseBuilder builder() {
		return new QuoteResponseBuilder();
	}

	public static class QuoteResponseBuilder {
		private String text;
		private String author;

		public QuoteResponseBuilder text(String text) { this.text = text; return this; }
		public QuoteResponseBuilder author(String author) { this.author = author; return this; }

		public QuoteResponse build() {
            QuoteResponse obj = new QuoteResponse();
            obj.setText(text);
            obj.setAuthor(author);
            return obj;
        }
	}
}
