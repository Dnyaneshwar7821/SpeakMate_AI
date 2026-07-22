package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VocabularyResponse {

	private Long id;

	private String word;

	private String meaning;

	private String exampleSentence;

	private String synonym;

	private String antonym;

	private Boolean favorite;

	private LocalDateTime createdAt;

}