package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.PaymentGateway;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;
    
    // User info
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;

    // Subscription Plan info
    private Long planId;
    private String planName;

    private Double amount;
    private String currency;
    
    private PaymentMethod paymentMethod;
    private PaymentGateway paymentGateway;
    private String transactionId;
    private PaymentStatus paymentStatus;
    
    private LocalDateTime paymentDate;
    private String remarks;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
