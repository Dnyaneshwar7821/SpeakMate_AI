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

}
