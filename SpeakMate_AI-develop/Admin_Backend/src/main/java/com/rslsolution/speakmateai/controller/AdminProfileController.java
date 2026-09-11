package com.rslsolution.speakmateai.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.AdminProfileUpdateRequest;
import com.rslsolution.speakmateai.dto.request.ChangePasswordRequest;
import com.rslsolution.speakmateai.dto.response.AdminProfileResponse;
import com.rslsolution.speakmateai.dto.response.ApiResponse;
import com.rslsolution.speakmateai.service.AdminProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/profile")
public class AdminProfileController {

    private final AdminProfileService adminProfileService;

    public AdminProfileController(AdminProfileService adminProfileService) {
        this.adminProfileService = adminProfileService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminProfileResponse>> getProfile(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", adminProfileService.getProfile(principal.getName())));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<AdminProfileResponse>> updateProfile(Principal principal, @Valid @RequestBody AdminProfileUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", adminProfileService.updateProfile(principal.getName(), request)));
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
        adminProfileService.changePassword(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }
}
