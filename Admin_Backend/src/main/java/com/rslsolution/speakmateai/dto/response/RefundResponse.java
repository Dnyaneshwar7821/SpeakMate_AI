package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.RefundStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundResponse {

    private Long id;
    
    private Long paymentId;
    private String transactionId;

    private Double refundAmount;
    private String refundReason;
    private RefundStatus refundStatus;
    private LocalDateTime refundDate;

    private LocalDateTime createdAt;
}
