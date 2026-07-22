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
public class SpeakingSessionResponse {

	private Long id;

	private String topic;

	private String transcript;

	private Integer duration;

	private Double pronunciationScore;

	private Double fluencyScore;

	private Double grammarScore;

	private Double vocabularyScore;

	private Double overallScore;

	private String feedback;

	private LocalDateTime createdAt;

}