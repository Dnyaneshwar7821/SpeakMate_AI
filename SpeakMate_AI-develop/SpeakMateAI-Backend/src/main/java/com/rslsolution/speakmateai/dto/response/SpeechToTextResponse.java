package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeechToTextResponse {

	private String transcript;

	public String getTranscript() { return transcript; }
	public void setTranscript(String transcript) { this.transcript = transcript; }

	public static SpeechToTextResponseBuilder builder() {
		return new SpeechToTextResponseBuilder();
	}

	public static class SpeechToTextResponseBuilder {
		private String transcript;

		public SpeechToTextResponseBuilder transcript(String transcript) { this.transcript = transcript; return this; }

		public SpeechToTextResponse build() {
            SpeechToTextResponse obj = new SpeechToTextResponse();
            obj.setTranscript(transcript);
            return obj;
        }
	}
}