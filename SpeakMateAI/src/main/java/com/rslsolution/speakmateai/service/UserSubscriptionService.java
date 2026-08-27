package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.CreateOrderRequest;
import com.rslsolution.speakmateai.dto.request.VerifyPaymentRequest;
import com.rslsolution.speakmateai.dto.response.CreateOrderResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionStatusResponse;

public interface UserSubscriptionService {

	CreateOrderResponse createOrder(CreateOrderRequest request);

	SubscriptionStatusResponse verifyPayment(VerifyPaymentRequest request);

	SubscriptionStatusResponse getMySubscription();

	SubscriptionStatusResponse cancelSubscription();
}
