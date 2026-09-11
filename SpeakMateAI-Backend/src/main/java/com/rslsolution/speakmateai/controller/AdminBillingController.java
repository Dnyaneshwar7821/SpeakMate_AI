package com.rslsolution.speakmateai.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.RefundRequest;
import com.rslsolution.speakmateai.dto.response.ApiResponse;
import com.rslsolution.speakmateai.dto.response.BillingStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.InvoiceResponse;
import com.rslsolution.speakmateai.dto.response.PaymentResponse;
import com.rslsolution.speakmateai.dto.response.RefundResponse;
import com.rslsolution.speakmateai.enums.PaymentGateway;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.service.AdminBillingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/billing")
public class AdminBillingController {

    private final AdminBillingService adminBillingService;

    public AdminBillingController(AdminBillingService adminBillingService) {
        this.adminBillingService = adminBillingService;
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully",
                adminBillingService.getAllPayments(page, size, sortBy, sortDir)));
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Payment retrieved successfully", adminBillingService.getPaymentById(id)));
    }

    @GetMapping("/payments/search")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> searchPayments(
            @RequestParam String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Payments searched successfully",
                adminBillingService.searchPayments(search, page, size, sortBy, sortDir)));
    }

    @GetMapping("/payments/filter")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> filterPayments(
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) PaymentGateway paymentGateway,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @RequestParam(required = false) Double minAmount,
            @RequestParam(required = false) Double maxAmount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Payments filtered successfully",
                adminBillingService.filterPayments(paymentStatus, paymentMethod, paymentGateway, startDate,
                        endDate, minAmount, maxAmount, page, size, sortBy, sortDir)));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<Page<InvoiceResponse>>> getInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully",
                adminBillingService.getInvoices(page, size, sortBy, sortDir)));
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.success("Invoice retrieved successfully", adminBillingService.getInvoiceById(id)));
    }

    @PostMapping("/invoices")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@RequestParam Long paymentId) {
        return ResponseEntity.ok(
                ApiResponse.success("Invoice created successfully", adminBillingService.createInvoice(paymentId)));
    }

    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<ApiResponse<String>> deleteInvoice(@PathVariable Long id) {
        adminBillingService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully"));
    }

    @PostMapping("/refund/{paymentId}")
    public ResponseEntity<ApiResponse<RefundResponse>> requestRefund(
            @PathVariable Long paymentId,
            @Valid @RequestBody RefundRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success("Refund requested successfully",
                        adminBillingService.requestRefund(paymentId, request)));
    }

    @GetMapping("/refunds")
    public ResponseEntity<ApiResponse<Page<RefundResponse>>> getRefunds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Refunds retrieved successfully",
                adminBillingService.getRefunds(page, size, sortBy, sortDir)));
    }

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<Double>> getRevenue() {
        return ResponseEntity.ok(ApiResponse.success("Total revenue retrieved", adminBillingService.getRevenue()));
    }

    @GetMapping("/revenue/today")
    public ResponseEntity<ApiResponse<Double>> getTodayRevenue() {
        return ResponseEntity.ok(
                ApiResponse.success("Today's revenue retrieved", adminBillingService.getTodayRevenue()));
    }

    @GetMapping("/revenue/monthly")
    public ResponseEntity<ApiResponse<Double>> getMonthlyRevenue() {
        return ResponseEntity.ok(
                ApiResponse.success("Monthly revenue retrieved", adminBillingService.getMonthlyRevenue()));
    }

    @GetMapping("/revenue/yearly")
    public ResponseEntity<ApiResponse<Double>> getYearlyRevenue() {
        return ResponseEntity.ok(
                ApiResponse.success("Yearly revenue retrieved", adminBillingService.getYearlyRevenue()));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<BillingStatisticsResponse>> getBillingStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Billing statistics retrieved",
                adminBillingService.getBillingStatistics()));
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportPaymentsCsv() {
        String csvData = adminBillingService.exportPaymentsCsv();
        byte[] output = csvData.getBytes();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "billing_report.csv");
        headers.setContentLength(output.length);
        return new ResponseEntity<>(output, headers, org.springframework.http.HttpStatus.OK);
    }
}
