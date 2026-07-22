package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingMessageResponse {

	private String aiReply;

	// Tutor correction feedback
	private String grammarCorrection;
	private String betterSentence;
	private String vocabularySuggestions;
	private String explanation;
	private String followUpQuestion;
}
