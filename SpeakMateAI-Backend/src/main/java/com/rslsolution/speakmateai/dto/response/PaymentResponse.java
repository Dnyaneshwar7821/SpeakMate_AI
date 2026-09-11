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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFirstName() { return userFirstName; }
    public void setUserFirstName(String userFirstName) { this.userFirstName = userFirstName; }

    public String getUserLastName() { return userLastName; }
    public void setUserLastName(String userLastName) { this.userLastName = userLastName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentGateway getPaymentGateway() { return paymentGateway; }
    public void setPaymentGateway(PaymentGateway paymentGateway) { this.paymentGateway = paymentGateway; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static PaymentResponseBuilder builder() {
        return new PaymentResponseBuilder();
    }

    public static class PaymentResponseBuilder {
        private Long id;
        private Long userId;
        private String userFirstName;
        private String userLastName;
        private String userEmail;
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

        public PaymentResponseBuilder id(Long id) { this.id = id; return this; }
        public PaymentResponseBuilder userId(Long userId) { this.userId = userId; return this; }
        public PaymentResponseBuilder userFirstName(String userFirstName) { this.userFirstName = userFirstName; return this; }
        public PaymentResponseBuilder userLastName(String userLastName) { this.userLastName = userLastName; return this; }
        public PaymentResponseBuilder userEmail(String userEmail) { this.userEmail = userEmail; return this; }
        public PaymentResponseBuilder planId(Long planId) { this.planId = planId; return this; }
        public PaymentResponseBuilder planName(String planName) { this.planName = planName; return this; }
        public PaymentResponseBuilder amount(Double amount) { this.amount = amount; return this; }
        public PaymentResponseBuilder currency(String currency) { this.currency = currency; return this; }
        public PaymentResponseBuilder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public PaymentResponseBuilder paymentGateway(PaymentGateway paymentGateway) { this.paymentGateway = paymentGateway; return this; }
        public PaymentResponseBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public PaymentResponseBuilder paymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; return this; }
        public PaymentResponseBuilder paymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; return this; }
        public PaymentResponseBuilder remarks(String remarks) { this.remarks = remarks; return this; }
        public PaymentResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public PaymentResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public PaymentResponse build() {
            PaymentResponse p = new PaymentResponse();
            p.id = id;
            p.userId = userId;
            p.userFirstName = userFirstName;
            p.userLastName = userLastName;
            p.userEmail = userEmail;
            p.planId = planId;
            p.planName = planName;
            p.amount = amount;
            p.currency = currency;
            p.paymentMethod = paymentMethod;
            p.paymentGateway = paymentGateway;
            p.transactionId = transactionId;
            p.paymentStatus = paymentStatus;
            p.paymentDate = paymentDate;
            p.remarks = remarks;
            p.createdAt = createdAt;
            p.updatedAt = updatedAt;
            return p;
        }
    }
}
