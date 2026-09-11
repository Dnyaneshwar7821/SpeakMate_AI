package com.rslsolution.speakmateai.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.rslsolution.speakmateai.dto.request.SubscriptionPlanCreateRequest;
import com.rslsolution.speakmateai.dto.request.SubscriptionPlanUpdateRequest;
import com.rslsolution.speakmateai.dto.response.ApiResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionPlanResponse;
import com.rslsolution.speakmateai.dto.response.SubscriptionStatisticsResponse;
import com.rslsolution.speakmateai.dto.response.UserSubscriptionResponse;
import com.rslsolution.speakmateai.enums.PaymentMethod;
import com.rslsolution.speakmateai.enums.PaymentStatus;
import com.rslsolution.speakmateai.enums.SubscriptionStatus;
import com.rslsolution.speakmateai.service.AdminSubscriptionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/subscriptions")
public class AdminSubscriptionController {

    private final AdminSubscriptionService subscriptionService;

    public AdminSubscriptionController(AdminSubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SubscriptionPlanResponse>>> getAllPlans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plans retrieved successfully", 
                subscriptionService.getAllPlans(page, size, sortBy, sortDir)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> getPlanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan retrieved successfully", 
                subscriptionService.getPlanById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> createPlan(
            @Valid @RequestBody SubscriptionPlanCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan created successfully", 
                subscriptionService.createPlan(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> updatePlan(
            @PathVariable Long id, @Valid @RequestBody SubscriptionPlanUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan updated successfully", 
                subscriptionService.updatePlan(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        subscriptionService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan deactivated successfully"));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> activatePlan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan activated successfully", 
                subscriptionService.activatePlan(id)));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> deactivatePlan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan deactivated successfully", 
                subscriptionService.deactivatePlan(id)));
    }

    @PostMapping("/assign")
    public ResponseEntity<ApiResponse<UserSubscriptionResponse>> assignPlanToUser(
            @RequestParam Long userId,
            @RequestParam Long planId,
            @RequestParam PaymentMethod paymentMethod,
            @RequestParam Double amountPaid,
            @RequestParam(required = false) String transactionId) {
        return ResponseEntity.ok(ApiResponse.success("Subscription Plan assigned successfully", 
                subscriptionService.assignPlanToUser(userId, planId, paymentMethod, amountPaid, transactionId)));
    }

    @PutMapping("/renew/{subscriptionId}")
    public ResponseEntity<ApiResponse<UserSubscriptionResponse>> renewSubscription(
            @PathVariable Long subscriptionId,
            @RequestParam PaymentMethod paymentMethod,
            @RequestParam Double amountPaid,
            @RequestParam(required = false) String transactionId) {
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed successfully", 
                subscriptionService.renewSubscription(subscriptionId, paymentMethod, amountPaid, transactionId)));
    }

    @PutMapping("/cancel/{subscriptionId}")
    public ResponseEntity<ApiResponse<UserSubscriptionResponse>> cancelSubscription(
            @PathVariable Long subscriptionId) {
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", 
                subscriptionService.cancelSubscription(subscriptionId)));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserSubscriptionResponse>>> getUserSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("User Subscriptions retrieved successfully", 
                subscriptionService.getUserSubscriptions(page, size, sortBy, sortDir)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<SubscriptionPlanResponse>>> searchPlans(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Plans searched successfully", 
                subscriptionService.searchPlans(keyword, page, size, sortBy, sortDir)));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<Page<UserSubscriptionResponse>>> filterSubscriptions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) SubscriptionStatus subscriptionStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Subscriptions filtered successfully", 
                subscriptionService.filterSubscriptions(keyword, paymentStatus, subscriptionStatus, paymentMethod, startDate, endDate, page, size, sortBy, sortDir)));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<SubscriptionStatisticsResponse>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success("Subscription statistics retrieved successfully", 
                subscriptionService.getStatistics()));
    }

    @GetMapping("/export")
    public ResponseEntity<String> exportSubscriptions() {
        String csvData = subscriptionService.exportSubscriptionsCsv();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentDispositionFormData("attachment", "subscriptions_export.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }
}
