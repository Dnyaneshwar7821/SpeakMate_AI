package com.rslsolution.speakmateai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.CreateOrderRequest;
import com.rslsolution.speakmateai.dto.request.VerifyPaymentRequest;
import com.rslsolution.speakmateai.dto.response.CreateOrderResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionStatusResponse;
import com.rslsolution.speakmateai.service.UserSubscriptionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/subscription")
public class UserSubscriptionController {

	private final UserSubscriptionService userSubscriptionService;

	public UserSubscriptionController(UserSubscriptionService userSubscriptionService) {
		this.userSubscriptionService = userSubscriptionService;
	}

	@PostMapping("/create-order")
	public ResponseEntity<CreateOrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
		CreateOrderResponse response = userSubscriptionService.createOrder(request);
		return ResponseEntity.ok(response);
	}

	@PostMapping("/verify-payment")
	public ResponseEntity<SubscriptionStatusResponse> verifyPayment(@Valid @RequestBody VerifyPaymentRequest request) {
		SubscriptionStatusResponse response = userSubscriptionService.verifyPayment(request);
		return ResponseEntity.ok(response);
	}

	@GetMapping("/my-subscription")
	public ResponseEntity<SubscriptionStatusResponse> getMySubscription() {
		SubscriptionStatusResponse response = userSubscriptionService.getMySubscription();
		return ResponseEntity.ok(response);
	}
}
