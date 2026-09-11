package com.rslsolution.speakmateai.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.AppearanceSettingsRequest;
import com.rslsolution.speakmateai.dto.request.LanguageSettingsRequest;
import com.rslsolution.speakmateai.dto.request.NotificationSettingsRequest;
import com.rslsolution.speakmateai.dto.request.SecuritySettingsRequest;
import com.rslsolution.speakmateai.dto.response.AdminSettingsResponse;
import com.rslsolution.speakmateai.dto.response.ApiResponse;
import com.rslsolution.speakmateai.service.AdminSettingsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/settings")
public class AdminSettingsController {

    private final AdminSettingsService adminSettingsService;

    public AdminSettingsController(AdminSettingsService adminSettingsService) {
        this.adminSettingsService = adminSettingsService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> getSettings(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success("Settings retrieved successfully", adminSettingsService.getSettings(principal.getName())));
    }

    @PutMapping("/appearance")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> updateAppearance(Principal principal, @Valid @RequestBody AppearanceSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Appearance settings updated successfully", adminSettingsService.updateAppearance(principal.getName(), request)));
    }

    @PutMapping("/language")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> updateLanguage(Principal principal, @Valid @RequestBody LanguageSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Language settings updated successfully", adminSettingsService.updateLanguage(principal.getName(), request)));
    }

    @PutMapping("/notifications")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> updateNotifications(Principal principal, @Valid @RequestBody NotificationSettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Notification settings updated successfully", adminSettingsService.updateNotifications(principal.getName(), request)));
    }

    @PutMapping("/security")
    public ResponseEntity<ApiResponse<AdminSettingsResponse>> updateSecurity(Principal principal, @Valid @RequestBody SecuritySettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Security settings updated successfully", adminSettingsService.updateSecurity(principal.getName(), request)));
    }
}
