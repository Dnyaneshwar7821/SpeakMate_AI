package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.RefundRequest;
import com.rslsolution.speakmateai.dto.response.BillingStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.InvoiceResponse;
import com.rslsolution.speakmateai.dto.response.PaymentResponse;
import com.rslsolution.speakmateai.dto.response.RefundResponse;
import com.rslsolution.speakmateai.entity.Invoice;
import com.rslsolution.speakmateai.entity.Payment;
import com.rslsolution.speakmateai.entity.Refund;
import com.rslsolution.speakmateai.enums.InvoiceStatus;
import com.rslsolution.speakmateai.enums.PaymentGateway;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.RefundStatus;
import com.rslsolution.speakmateai.exception.ResourceNotFoundException;
import com.rslsolution.speakmateai.repository.BillingSpecification;
import com.rslsolution.speakmateai.repository.InvoiceRepository;
import com.rslsolution.speakmateai.repository.PaymentRepository;
import com.rslsolution.speakmateai.repository.RefundRepository;
import com.rslsolution.speakmateai.service.AdminBillingService;

@Service
@Transactional
public class AdminBillingServiceImpl implements AdminBillingService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final RefundRepository refundRepository;

    public AdminBillingServiceImpl(PaymentRepository paymentRepository, InvoiceRepository invoiceRepository,
            RefundRepository refundRepository) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
        this.refundRepository = refundRepository;
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getUser().getId())
                .userFirstName(payment.getUser().getFirstName())
                .userLastName(payment.getUser().getLastName())
                .userEmail(payment.getUser().getEmail())
                .planId(payment.getSubscriptionPlan().getId())
                .planName(payment.getSubscriptionPlan().getPlanName())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .paymentMethod(payment.getPaymentMethod())
                .paymentGateway(payment.getPaymentGateway())
                .transactionId(payment.getTransactionId())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .remarks(payment.getRemarks())
                .createdAt(payment.getCreatedAt())
                .updatedAt(payment.getUpdatedAt())
                .build();
    }

    private InvoiceResponse mapToInvoiceResponse(Invoice invoice) {
        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .paymentId(invoice.getPayment().getId())
                .transactionId(invoice.getPayment().getTransactionId())
                .amount(invoice.getAmount())
                .tax(invoice.getTax())
                .totalAmount(invoice.getTotalAmount())
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .invoiceStatus(invoice.getInvoiceStatus())
                .pdfUrl(invoice.getPdfUrl())
                .createdAt(invoice.getCreatedAt())
                .updatedAt(invoice.getUpdatedAt())
                .build();
    }

    private RefundResponse mapToRefundResponse(Refund refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .paymentId(refund.getPayment().getId())
                .transactionId(refund.getPayment().getTransactionId())
                .refundAmount(refund.getRefundAmount())
                .refundReason(refund.getRefundReason())
                .refundStatus(refund.getRefundStatus())
                .refundDate(refund.getRefundDate())
                .createdAt(refund.getCreatedAt())
                .build();
    }

    @Override
    public Page<PaymentResponse> getAllPayments(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return paymentRepository.findAll(pageable).map(this::mapToPaymentResponse);
    }

    @Override
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return mapToPaymentResponse(payment);
    }

    @Override
    public Page<InvoiceResponse> getInvoices(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return invoiceRepository.findAll(pageable).map(this::mapToInvoiceResponse);
    }

    @Override
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return mapToInvoiceResponse(invoice);
    }

    @Override
    public InvoiceResponse createInvoice(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalArgumentException("Cannot generate invoice for unpaid payment");
        }

        double taxRate = 0.18; // 18% tax example
        double tax = payment.getAmount() * taxRate;
        double totalAmount = payment.getAmount() + tax;

        Invoice invoice = Invoice.builder()
                .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .payment(payment)
                .amount(payment.getAmount())
                .tax(tax)
                .totalAmount(totalAmount)
                .invoiceDate(LocalDateTime.now())
                .dueDate(LocalDateTime.now().plusDays(15))
                .invoiceStatus(InvoiceStatus.GENERATED)
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToInvoiceResponse(savedInvoice);
    }

    @Override
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        invoiceRepository.delete(invoice);
    }

    @Override
    public RefundResponse requestRefund(Long paymentId, RefundRequest request) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (payment.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalArgumentException("Cannot refund a payment that is not PAID");
        }

        if (request.getRefundAmount() > payment.getAmount()) {
            throw new IllegalArgumentException("Refund amount cannot exceed the payment amount");
        }

        Refund refund = Refund.builder()
                .payment(payment)
                .refundAmount(request.getRefundAmount())
                .refundReason(request.getRefundReason())
                .refundStatus(RefundStatus.PENDING)
                .build();

        // Update payment status
        payment.setPaymentStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(payment);

        Refund savedRefund = refundRepository.save(refund);
        return mapToRefundResponse(savedRefund);
    }

    @Override
    public Page<RefundResponse> getRefunds(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return refundRepository.findAll(pageable).map(this::mapToRefundResponse);
    }

    @Override
    public Page<PaymentResponse> searchPayments(String search, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return paymentRepository
                .findAll(BillingSpecification.filterPayments(search, null, null, null, null, null, null, null), pageable)
                .map(this::mapToPaymentResponse);
    }

    @Override
    public Page<PaymentResponse> filterPayments(PaymentStatus paymentStatus, PaymentMethod paymentMethod,
            PaymentGateway paymentGateway, LocalDateTime startDate, LocalDateTime endDate, Double minAmount,
            Double maxAmount, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return paymentRepository.findAll(BillingSpecification.filterPayments(null, paymentStatus, paymentMethod,
                paymentGateway, startDate, endDate, minAmount, maxAmount), pageable).map(this::mapToPaymentResponse);
    }

    @Override
    public Double getRevenue() {
        Double sum = paymentRepository.sumTotalRevenue();
        return sum != null ? sum : 0.0;
    }

    @Override
    public Double getMonthlyRevenue() {
        LocalDateTime startOfMonth = LocalDateTime.now().with(TemporalAdjusters.firstDayOfMonth()).withHour(0)
                .withMinute(0).withSecond(0).withNano(0);
        Double sum = paymentRepository.sumRevenueSince(startOfMonth);
        return sum != null ? sum : 0.0;
    }

    @Override
    public Double getYearlyRevenue() {
        LocalDateTime startOfYear = LocalDateTime.now().with(TemporalAdjusters.firstDayOfYear()).withHour(0).withMinute(0)
                .withSecond(0).withNano(0);
        Double sum = paymentRepository.sumRevenueSince(startOfYear);
        return sum != null ? sum : 0.0;
    }

    @Override
    public Double getTodayRevenue() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        Double sum = paymentRepository.sumRevenueSince(startOfDay);
        return sum != null ? sum : 0.0;
    }

    @Override
    public String exportPaymentsCsv() {
        List<Payment> payments = paymentRepository.findAll(Sort.by("paymentDate").descending());
        payments.sort(Comparator.comparing(Payment::getId, Comparator.nullsLast(Comparator.naturalOrder())));
        StringBuilder csv = new StringBuilder();
        csv.append("ID,User Name,Email,Plan,Amount,Currency,Method,Gateway,Transaction ID,Status,Date\n");
        for (Payment p : payments) {
            csv.append(p.getId()).append(",");
            csv.append(escapeCsv(p.getUser().getFirstName() + " " + p.getUser().getLastName())).append(",");
            csv.append(escapeCsv(p.getUser().getEmail())).append(",");
            csv.append(escapeCsv(p.getSubscriptionPlan().getPlanName())).append(",");
            csv.append(p.getAmount()).append(",");
            csv.append(p.getCurrency()).append(",");
            csv.append(p.getPaymentMethod()).append(",");
            csv.append(p.getPaymentGateway()).append(",");
            csv.append(escapeCsv(p.getTransactionId())).append(",");
            csv.append(p.getPaymentStatus()).append(",");
            csv.append(p.getPaymentDate()).append("\n");
        }
        return csv.toString();
    }

    private String escapeCsv(String data) {
        if (data == null)
            return "";
        if (data.contains(",") || data.contains("\"") || data.contains("\n")) {
            return "\"" + data.replace("\"", "\"\"") + "\"";
        }
        return data;
    }

    @Override
    public BillingStatisticsResponse getBillingStatistics() {
        return BillingStatisticsResponse.builder()
                .totalRevenue(getRevenue())
                .todaysRevenue(getTodayRevenue())
                .monthlyRevenue(getMonthlyRevenue())
                .yearlyRevenue(getYearlyRevenue())
                .totalPayments(paymentRepository.count())
                .successfulPayments(paymentRepository.countByPaymentStatus(PaymentStatus.PAID))
                .pendingPayments(paymentRepository.countByPaymentStatus(PaymentStatus.PENDING))
                .failedPayments(paymentRepository.countByPaymentStatus(PaymentStatus.FAILED))
                .refundedPayments(paymentRepository.countByPaymentStatus(PaymentStatus.REFUNDED))
                .totalInvoices(invoiceRepository.count())
                .totalRefunds(refundRepository.count())
                .build();
    }
}
