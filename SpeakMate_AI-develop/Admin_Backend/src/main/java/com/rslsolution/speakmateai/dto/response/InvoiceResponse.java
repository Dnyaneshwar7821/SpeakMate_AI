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
}
