package com.rslsolution.speakmateai.dto.integration;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RazorpayTestOrderResponse {
	private String orderId;
	private String keyId;
	private BigDecimal amount;
	private String currency;
	private String receipt;
	private String status;
	private String description;
}
