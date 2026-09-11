package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.InvoiceStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;
    
    // Payment summary
    private Long paymentId;
    private String transactionId;

    private Double amount;
    private Double tax;
    private Double totalAmount;

    private LocalDateTime invoiceDate;
    private LocalDateTime dueDate;

    private InvoiceStatus invoiceStatus;
    private String pdfUrl;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

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

    public static InvoiceResponseBuilder builder() {
        return new InvoiceResponseBuilder();
    }

    public static class InvoiceResponseBuilder {
        private Long id;
        private String invoiceNumber;
        private Long paymentId;
        private String transactionId;
        private Double amount;
        private Double tax;
        private Double totalAmount;
        private LocalDateTime invoiceDate;
        private LocalDateTime dueDate;
        private InvoiceStatus invoiceStatus;
        private String pdfUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public InvoiceResponseBuilder id(Long id) { this.id = id; return this; }
        public InvoiceResponseBuilder invoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; return this; }
        public InvoiceResponseBuilder paymentId(Long paymentId) { this.paymentId = paymentId; return this; }
        public InvoiceResponseBuilder transactionId(String transactionId) { this.transactionId = transactionId; return this; }
        public InvoiceResponseBuilder amount(Double amount) { this.amount = amount; return this; }
        public InvoiceResponseBuilder tax(Double tax) { this.tax = tax; return this; }
        public InvoiceResponseBuilder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public InvoiceResponseBuilder invoiceDate(LocalDateTime invoiceDate) { this.invoiceDate = invoiceDate; return this; }
        public InvoiceResponseBuilder dueDate(LocalDateTime dueDate) { this.dueDate = dueDate; return this; }
        public InvoiceResponseBuilder invoiceStatus(InvoiceStatus invoiceStatus) { this.invoiceStatus = invoiceStatus; return this; }
        public InvoiceResponseBuilder pdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; return this; }
        public InvoiceResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public InvoiceResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public InvoiceResponse build() {
            InvoiceResponse r = new InvoiceResponse();
            r.id = id;
            r.invoiceNumber = invoiceNumber;
            r.paymentId = paymentId;
            r.transactionId = transactionId;
            r.amount = amount;
            r.tax = tax;
            r.totalAmount = totalAmount;
            r.invoiceDate = invoiceDate;
            r.dueDate = dueDate;
            r.invoiceStatus = invoiceStatus;
            r.pdfUrl = pdfUrl;
            r.createdAt = createdAt;
            r.updatedAt = updatedAt;
            return r;
        }
    }
}
