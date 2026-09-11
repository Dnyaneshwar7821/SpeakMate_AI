package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionStatusResponse {

	@JsonProperty("isPro")
	private boolean isPro;

	@JsonProperty("pro")
	public boolean getPro() {
		return isPro;
	}

	private String planType; // FREE, MONTHLY_PRO, YEARLY_PRO
	private String status; // ACTIVE, EXPIRED, CANCELLED
	private LocalDateTime startDate;
	private LocalDateTime endDate;
	private Integer dailyMinutesLimit; // e.g. 10 for Free, unlimited (e.g. 9999) for Pro
	private Integer dailyMinutesUsed;
	private Integer dailyGrammarLimit; // e.g. 5 for Free, unlimited for Pro
	private Integer dailyGrammarUsed;
	private String message;
}
