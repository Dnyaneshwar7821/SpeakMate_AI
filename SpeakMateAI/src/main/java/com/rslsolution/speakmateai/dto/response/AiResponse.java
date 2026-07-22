package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiResponse {

	private String response;

	public String getResponse() { return response; }
	public void setResponse(String response) { this.response = response; }

	public static AiResponseBuilder builder() {
		return new AiResponseBuilder();
	}

	public static class AiResponseBuilder {
		private String response;

		public AiResponseBuilder response(String response) { this.response = response; return this; }

		public AiResponse build() {
			return new AiResponse(response);
		}
	}
}