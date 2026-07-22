package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {

	private Long id;
	private String sender;
	private String message;
	private boolean voiceEnabled;
	private String grammarCorrection;
	private String betterSentence;
	private String vocabularySuggestions;
	private String explanation;
	private String followUpQuestion;
	private boolean bookmarked;
	private LocalDateTime createdAt;

}
