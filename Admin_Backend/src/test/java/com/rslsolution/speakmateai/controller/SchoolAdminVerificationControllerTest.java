package com.rslsolution.speakmateai.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendOtpRequest;
import com.rslsolution.speakmateai.dto.request.SchoolAdminVerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendOtpResponse;
import com.rslsolution.speakmateai.dto.response.SchoolAdminVerifyOtpResponse;
import com.rslsolution.speakmateai.service.SchoolAdminVerificationService;

@ExtendWith(MockitoExtension.class)
public class SchoolAdminVerificationControllerTest {

    @Mock
    private SchoolAdminVerificationService verificationService;

    private SchoolAdminVerificationController controller;

    @BeforeEach
    public void setUp() {
        controller = new SchoolAdminVerificationController(verificationService);
    }

    @Test
    public void testSendOtpEndpoint() {
        SchoolAdminSendOtpRequest request = SchoolAdminSendOtpRequest.builder()
                .email("schooladmin@example.com")
                .build();

        SchoolAdminSendOtpResponse mockResponse = SchoolAdminSendOtpResponse.builder()
                .success(true)
                .message("Verification OTP has been sent successfully.")
                .email("schooladmin@example.com")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        when(verificationService.sendOtp(any(SchoolAdminSendOtpRequest.class))).thenReturn(mockResponse);

        ResponseEntity<SchoolAdminSendOtpResponse> response = controller.sendOtp(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("schooladmin@example.com", response.getBody().getEmail());
        verify(verificationService).sendOtp(request);
    }

    @Test
    public void testVerifyOtpEndpoint() {
        SchoolAdminVerifyOtpRequest request = SchoolAdminVerifyOtpRequest.builder()
                .email("schooladmin@example.com")
                .otp("123456")
                .build();

        SchoolAdminVerifyOtpResponse mockResponse = SchoolAdminVerifyOtpResponse.builder()
                .success(true)
                .message("Email verified successfully.")
                .verifiedEmail("schooladmin@example.com")
                .verificationToken("sample-verification-token-32-chars")
                .expiresAt(LocalDateTime.now().plusMinutes(30))
                .build();

        when(verificationService.verifyOtp(any(SchoolAdminVerifyOtpRequest.class))).thenReturn(mockResponse);

        ResponseEntity<SchoolAdminVerifyOtpResponse> response = controller.verifyOtp(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertEquals("sample-verification-token-32-chars", response.getBody().getVerificationToken());
        assertEquals("schooladmin@example.com", response.getBody().getVerifiedEmail());
        verify(verificationService).verifyOtp(request);
    }
}
