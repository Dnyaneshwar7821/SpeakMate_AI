package com.rslsolution.speakmateai.entity;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.InvoiceStatus;

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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String invoiceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double tax;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private LocalDateTime invoiceDate;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoiceStatus invoiceStatus;

    private String pdfUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Payment getPayment() { return payment; }
    public void setPayment(Payment payment) { this.payment = payment; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Double getTax() { return tax; }
    public void setTax(Double tax) { this.tax = tax; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(LocalDateTime invoiceDate) { this.invoiceDate = invoiceDate; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public InvoiceStatus getInvoiceStatus() { return invoiceStatus; }
    public void setInvoiceStatus(InvoiceStatus invoiceStatus) { this.invoiceStatus = invoiceStatus; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static InvoiceBuilder builder() {
        return new InvoiceBuilder();
    }

    public static class InvoiceBuilder {
        private Long id;
        private String invoiceNumber;
        private Payment payment;
        private Double amount;
        private Double tax;
        private Double totalAmount;
        private LocalDateTime invoiceDate;
        private LocalDateTime dueDate;
        private InvoiceStatus invoiceStatus;
        private String pdfUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public InvoiceBuilder id(Long id) { this.id = id; return this; }
        public InvoiceBuilder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
        public InvoiceBuilder payment(Payment payment) { this.payment = payment; return this; }
        public InvoiceBuilder amount(Double amount) { this.amount = amount; return this; }
        public InvoiceBuilder tax(Double tax) { this.tax = tax; return this; }
        public InvoiceBuilder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public InvoiceBuilder invoiceDate(LocalDateTime invoiceDate) { this.invoiceDate = invoiceDate; return this; }
        public InvoiceBuilder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }
        public InvoiceBuilder invoiceStatus(InvoiceStatus invoiceStatus) { this.invoiceStatus = invoiceStatus; return this; }
        public InvoiceBuilder pdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; return this; }
        public InvoiceBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public InvoiceBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Invoice build() {
            Invoice inv = new Invoice();
            inv.setId(id);
            inv.setInvoiceNumber(invoiceNumber);
            inv.setPayment(payment);
            inv.setAmount(amount);
            inv.setTax(tax);
            inv.setTotalAmount(totalAmount);
            inv.setInvoiceDate(invoiceDate);
            inv.setDueDate(dueDate);
            inv.setInvoiceStatus(invoiceStatus);
            inv.setPdfUrl(pdfUrl);
            inv.setCreatedAt(createdAt);
            inv.setUpdatedAt(updatedAt);
            return inv;
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
