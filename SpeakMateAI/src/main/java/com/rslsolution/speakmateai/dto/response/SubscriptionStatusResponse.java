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
public class SubscriptionStatusResponse {

	private boolean isPro;
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
