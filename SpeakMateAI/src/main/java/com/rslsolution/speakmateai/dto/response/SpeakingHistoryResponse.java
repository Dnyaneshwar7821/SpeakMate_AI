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
public class SpeakingHistoryResponse {

	private Long id;

	private String scenario;

	private Integer duration; // in seconds

	private Integer xpEarned;

	private Double score;

	private String previewMessage; // last message or short preview

	private LocalDateTime createdAt;
}
