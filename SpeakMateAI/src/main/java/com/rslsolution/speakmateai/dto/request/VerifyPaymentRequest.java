package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyPaymentRequest {

	@NotBlank(message = "Razorpay Order ID is required")
	private String razorpayOrderId;

	@NotBlank(message = "Razorpay Payment ID is required")
	private String razorpayPaymentId;

	@NotBlank(message = "Razorpay Signature is required")
	private String razorpaySignature;

	@NotBlank(message = "Plan type is required")
	private String planType; // MONTHLY_PRO or YEARLY_PRO
}
