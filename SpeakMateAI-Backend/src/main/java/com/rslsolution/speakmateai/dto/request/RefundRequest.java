package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundRequest {

    @NotNull(message = "Refund amount is required")
    @Min(value = 0, message = "Refund amount cannot be negative")
    private Double refundAmount;

    @NotBlank(message = "Refund reason is required")
    private String refundReason;

    public Double getRefundAmount() { return refundAmount; }
    public void setRefundAmount(Double refundAmount) { this.refundAmount = refundAmount; }

    public String getRefundReason() { return refundReason; }
    public void setRefundReason(String refundReason) { this.refundReason = refundReason; }

    public static RefundRequestBuilder builder() {
        return new RefundRequestBuilder();
    }

    public static class RefundRequestBuilder {
        private Double refundAmount;
        private String refundReason;

        public RefundRequestBuilder refundAmount(Double refundAmount) { this.refundAmount = refundAmount; return this; }
        public RefundRequestBuilder refundReason(String refundReason) { this.refundReason = refundReason; return this; }

        public RefundRequest build() {
            RefundRequest req = new RefundRequest();
            req.setRefundAmount(refundAmount);
            req.setRefundReason(refundReason);
            return req;
        }
    }
}
