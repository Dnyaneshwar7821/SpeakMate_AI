package com.rslsolution.speakmateai.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;

import com.rslsolution.speakmateai.dto.request.SubscriptionPlanCreateRequest;
import com.rslsolution.speakmateai.dto.request.SubscriptionPlanUpdateRequest;
import com.rslsolution.speakmateai.dto.response.SubscriptionPlanResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserSubscriptionResponse;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;

public interface AdminSubscriptionService {

    Page<SubscriptionPlanResponse> getAllPlans(int page, int size, String sortBy, String sortDir);

    SubscriptionPlanResponse getPlanById(Long id);

    SubscriptionPlanResponse createPlan(SubscriptionPlanCreateRequest request);

    SubscriptionPlanResponse updatePlan(Long id, SubscriptionPlanUpdateRequest request);

    void deletePlan(Long id);

    SubscriptionPlanResponse activatePlan(Long id);

    SubscriptionPlanResponse deactivatePlan(Long id);

    UserSubscriptionResponse assignPlanToUser(Long userId, Long planId, PaymentMethod paymentMethod, Double amountPaid, String transactionId);

    UserSubscriptionResponse renewSubscription(Long subscriptionId, PaymentMethod paymentMethod, Double amountPaid, String transactionId);

    UserSubscriptionResponse cancelSubscription(Long subscriptionId);

    Page<UserSubscriptionResponse> getUserSubscriptions(int page, int size, String sortBy, String sortDir);

    Page<SubscriptionPlanResponse> searchPlans(String keyword, int page, int size, String sortBy, String sortDir);

    Page<UserSubscriptionResponse> filterSubscriptions(
            String keyword, PaymentStatus paymentStatus, SubscriptionStatus subscriptionStatus,
            PaymentMethod paymentMethod, LocalDateTime startDate, LocalDateTime endDate,
            int page, int size, String sortBy, String sortDir);

    String exportSubscriptionsCsv();

    SubscriptionStatisticsResponse getStatistics();
}
