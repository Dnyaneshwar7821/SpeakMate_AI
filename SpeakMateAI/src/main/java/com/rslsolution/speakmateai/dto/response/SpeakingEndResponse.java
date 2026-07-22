package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpeakingEndResponse {

	private Long sessionId;
	private String scenario;
	private Integer duration; // in seconds
	private Integer messagesExchanged;
	private Integer grammarMistakes;
	private Integer xpEarned;
	private Double score; // heuristic score (0 - 100)
	private String summary;
	private String vocabularyLearned;
	private String motivationalMessage;
}
