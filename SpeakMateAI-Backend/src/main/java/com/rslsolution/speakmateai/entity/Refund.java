package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.RefundStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(nullable = false)
    private Double refundAmount;

    @Column(columnDefinition = "TEXT")
    private String refundReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RefundStatus refundStatus;

    private LocalDateTime refundDate;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

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

    public static RefundBuilder builder() {
        return new RefundBuilder();
    }

    public static class RefundBuilder {
        private Long id;
        private Payment payment;
        private Double refundAmount;
        private String refundReason;
        private RefundStatus refundStatus;
        private LocalDateTime refundDate;
        private LocalDateTime createdAt;

        public RefundBuilder id(Long id) { this.id = id; return this; }
        public RefundBuilder payment(Payment payment) { this.payment = payment; return this; }
        public RefundBuilder refundAmount(Double refundAmount) { this.refundAmount = refundAmount; return this; }
        public RefundBuilder refundReason(String refundReason) { this.refundReason = refundReason; return this; }
        public RefundBuilder refundStatus(RefundStatus refundStatus) { this.refundStatus = refundStatus; return this; }
        public RefundBuilder refundDate(LocalDateTime refundDate) { this.refundDate = refundDate; return this; }
        public RefundBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Refund build() {
            Refund r = new Refund();
            r.setId(id);
            r.setPayment(payment);
            r.setRefundAmount(refundAmount);
            r.setRefundReason(refundReason);
            r.setRefundStatus(refundStatus);
            r.setRefundDate(refundDate);
            r.setCreatedAt(createdAt);
            return r;
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.refundDate == null && this.refundStatus == RefundStatus.COMPLETED) {
            this.refundDate = LocalDateTime.now();
        }
    }
}
