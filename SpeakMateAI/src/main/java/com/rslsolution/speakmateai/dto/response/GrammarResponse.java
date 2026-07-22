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
public class GrammarResponse {

	private Long id;

	private String originalText;

	private String correctedText;

	private String explanation;

	private Double grammarScore;

	private LocalDateTime createdAt;

}