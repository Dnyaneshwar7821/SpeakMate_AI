package com.rslsolution.speakmateai.service;

import org.springframework.data.domain.Page;

import com.rslsolution.speakmateai.dto.request.RefundRequest;
import com.rslsolution.speakmateai.dto.response.BillingStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.InvoiceResponse;
import com.rslsolution.speakmateai.dto.response.PaymentResponse;
import com.rslsolution.speakmateai.dto.response.RefundResponse;
import com.rslsolution.speakmateai.enums.PaymentGateway;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;

import java.time.LocalDateTime;

public interface AdminBillingService {

    Page<PaymentResponse> getAllPayments(int page, int size, String sortBy, String sortDir);

    PaymentResponse getPaymentById(Long id);

    Page<InvoiceResponse> getInvoices(int page, int size, String sortBy, String sortDir);

    InvoiceResponse getInvoiceById(Long id);

    InvoiceResponse createInvoice(Long paymentId);

    void deleteInvoice(Long id);

    RefundResponse requestRefund(Long paymentId, RefundRequest request);

    Page<RefundResponse> getRefunds(int page, int size, String sortBy, String sortDir);

    Page<PaymentResponse> searchPayments(String search, int page, int size, String sortBy, String sortDir);

    Page<PaymentResponse> filterPayments(
            PaymentStatus paymentStatus,
            PaymentMethod paymentMethod,
            PaymentGateway paymentGateway,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Double minAmount,
            Double maxAmount,
            int page, int size, String sortBy, String sortDir);

    Double getRevenue();

    Double getMonthlyRevenue();

    Double getYearlyRevenue();

    Double getTodayRevenue();

    String exportPaymentsCsv();

    BillingStatisticsResponse getBillingStatistics();
}
