package com.rslsolution.speakmateai.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendOtpRequest;
import com.rslsolution.speakmateai.dto.request.SchoolAdminVerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendOtpResponse;
import com.rslsolution.speakmateai.dto.response.SchoolAdminVerifyOtpResponse;
import com.rslsolution.speakmateai.service.SchoolAdminVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/schools/admin-verification-otp")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SchoolAdminVerificationController {

    private final SchoolAdminVerificationService verificationService;

    @PostMapping("/send")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SchoolAdminSendOtpResponse> sendOtp(@Valid @RequestBody SchoolAdminSendOtpRequest request) {
        SchoolAdminSendOtpResponse response = verificationService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<SchoolAdminVerifyOtpResponse> verifyOtp(@Valid @RequestBody SchoolAdminVerifyOtpRequest request) {
        SchoolAdminVerifyOtpResponse response = verificationService.verifyOtp(request);
        return ResponseEntity.ok(response);
    }
}
