package com.rslsolution.speakmateai.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderResponse {

	private String razorpayOrderId;
	private BigDecimal amount;
	private Long amountInPaise;
	private String currency;
	private String razorpayKeyId;
	private String planType;
	private String planName;
	private String description;
	private String userEmail;
	private String userName;
}
