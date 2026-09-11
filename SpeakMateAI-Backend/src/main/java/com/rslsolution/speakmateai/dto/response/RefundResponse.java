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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundReason() { return refundReason; }
    public void setRefundReason(String refundReason) { this.refundReason = refundReason; }

    public RefundStatus getRefundStatus() { return refundStatus; }
    public void setRefundStatus(RefundStatus refundStatus) { this.refundStatus = refundStatus; }

    public LocalDateTime getRefundDate() { return refundDate; }
    public void setRefundDate(LocalDateTime refundDate) { this.refundDate = refundDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static RefundResponseBuilder builder() {
        return new RefundResponseBuilder();
    }

    public static class RefundResponseBuilder {
        private Long id;
        private Long paymentId;
        private String transactionId;
        private Double refundAmount;
        private String refundReason;
        private RefundStatus refundStatus;
        private LocalDateTime refundDate;
        private LocalDateTime createdAt;

        public RefundResponseBuilder id(Long id) { this.id = id; return this; }
        public RefundResponseBuilder paymentId(Long paymentId) { this.paymentId = paymentId; return this; }
        public RefundResponseBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public RefundResponseBuilder refundAmount(Double refundAmount) { this.refundAmount = refundAmount; return this; }
        public RefundResponseBuilder refundReason(String refundReason) { this.refundReason = refundReason; return this; }
        public RefundResponseBuilder refundStatus(RefundStatus refundStatus) { this.refundStatus = refundStatus; return this; }
        public RefundResponseBuilder refundDate(LocalDateTime refundDate) { this.refundDate = refundDate; return this; }
        public RefundResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public RefundResponse build() {
            RefundResponse res = new RefundResponse();
            res.setId(id);
            res.setPaymentId(paymentId);
            res.setTransactionId(transactionId);
            res.setRefundAmount(refundAmount);
            res.setRefundReason(refundReason);
            res.setRefundStatus(refundStatus);
            res.setRefundDate(refundDate);
            res.setCreatedAt(createdAt);
            return res;
        }
    }
}
