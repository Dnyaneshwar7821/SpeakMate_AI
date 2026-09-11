package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSubscriptionResponse {

    private Long id;
    
    // User details snippet
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;

    // Subscription Plan details snippet
    private Long planId;
    private String planName;

    private LocalDateTime startDate;
    private LocalDateTime expiryDate;

    private PaymentStatus paymentStatus;
    private SubscriptionStatus subscriptionStatus;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private Double amountPaid;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
