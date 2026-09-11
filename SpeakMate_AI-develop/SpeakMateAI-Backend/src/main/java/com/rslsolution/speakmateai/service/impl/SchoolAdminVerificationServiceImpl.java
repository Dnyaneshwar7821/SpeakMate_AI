package com.rslsolution.speakmateai.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendOtpRequest;
import com.rslsolution.speakmateai.dto.request.SchoolAdminVerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendOtpResponse;
import com.rslsolution.speakmateai.dto.response.SchoolAdminVerifyOtpResponse;
import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;
import com.rslsolution.speakmateai.repository.SchoolAdminEmailVerificationRepository;
import com.rslsolution.speakmateai.service.EmailService;
import com.rslsolution.speakmateai.service.SchoolAdminVerificationService;
import com.rslsolution.speakmateai.service.email.EmailMessage;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SchoolAdminVerificationServiceImpl implements SchoolAdminVerificationService {

    private static final Logger logger = LoggerFactory.getLogger(SchoolAdminVerificationServiceImpl.class);

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int TOKEN_EXPIRY_MINUTES = 30;
    private static final int MAX_FAILED_ATTEMPTS = 5;

    private final SchoolAdminEmailVerificationRepository verificationRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public SchoolAdminSendOtpResponse sendOtp(SchoolAdminSendOtpRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Generate 6-digit OTP using SecureRandom (range 000000 - 999999)
        int otpNumber = secureRandom.nextInt(1_000_000);
        String otp = String.format("%06d", otpNumber);

        // 2. Hash OTP before persistence - plaintext OTP is NEVER persisted
        String otpHash = passwordEncoder.encode(otp);
        LocalDateTime otpExpiresAt = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        // 3. Obtain initiator identifier from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String createdBy = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "SUPER_ADMIN";

        // 4. Update existing verification record or create new
        SchoolAdminEmailVerification verification = verificationRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> SchoolAdminEmailVerification.builder()
                        .email(normalizedEmail)
                        .build());

        verification.setEmail(normalizedEmail);
        verification.setOtpHash(otpHash);
        verification.setOtpExpiresAt(otpExpiresAt);
        verification.setAttemptCount(0); // Reset attempts on fresh/resend OTP
        verification.setVerified(false); // Reset verification status
        verification.setVerificationToken(null); // Invalidate any previous token
        verification.setVerificationTokenExpiresAt(null);
        verification.setTokenConsumed(false);
        verification.setCreatedBy(createdBy);

        verificationRepository.save(verification);

        // 5. Build and send OTP email using existing EmailService abstraction
        try {
            String emailContent = buildOtpEmailHtml(otp);
            EmailMessage message = EmailMessage.html(
                    normalizedEmail,
                    "SpeakMate AI - School Admin Verification OTP",
                    emailContent,
                    "SpeakMate AI"
            );
            emailService.sendEmail(message);
        } catch (Exception ex) {
            logger.error("[SchoolAdminVerification] Failed to dispatch OTP email to recipient: {}", normalizedEmail, ex);
            String rawMsg = ex.getMessage() != null ? ex.getMessage() : "";
            if (rawMsg.contains("authorised_ips") || rawMsg.contains("unrecognised IP")) {
                throw new RuntimeException("Brevo API IP Authorization Required: Please add your public IP to Authorized IPs in Brevo security settings (https://app.brevo.com/security/authorised_ips).");
            }
            throw new RuntimeException("Failed to send verification email: " + (ex.getMessage() != null ? ex.getMessage() : "Please check your email configuration and try again."));
        }

        return SchoolAdminSendOtpResponse.builder()
                .success(true)
                .message("Verification OTP has been sent successfully.")
                .email(normalizedEmail)
                .expiresAt(otpExpiresAt)
                .build();
    }

    @Override
    @Transactional
    public SchoolAdminVerifyOtpResponse verifyOtp(SchoolAdminVerifyOtpRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
            throw new IllegalArgumentException("OTP code is required.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String submittedOtp = request.getOtp().trim();

        // 1. Retrieve verification record
        SchoolAdminEmailVerification verification = verificationRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("No verification request found for this email. Please request an OTP first."));

        // 2. Check maximum failed attempts
        if (verification.getAttemptCount() >= MAX_FAILED_ATTEMPTS) {
            throw new IllegalArgumentException("Maximum verification attempts exceeded. Please request a new OTP.");
        }

        // 3. Check OTP expiry
        if (verification.getOtpExpiresAt() == null || LocalDateTime.now().isAfter(verification.getOtpExpiresAt())) {
            throw new IllegalArgumentException("OTP has expired. Please request a new verification code.");
        }

        // 4. Verify OTP against stored hash
        if (verification.getOtpHash() == null || !passwordEncoder.matches(submittedOtp, verification.getOtpHash())) {
            int newAttemptCount = verification.getAttemptCount() + 1;
            verification.setAttemptCount(newAttemptCount);
            verificationRepository.save(verification);

            int remaining = MAX_FAILED_ATTEMPTS - newAttemptCount;
            if (remaining > 0) {
                throw new IllegalArgumentException("Invalid OTP code. " + remaining + " attempt(s) remaining.");
            } else {
                throw new IllegalArgumentException("Invalid OTP code. Maximum verification attempts exceeded. Please request a new OTP.");
            }
        }

        // 5. Successful OTP verification: generate cryptographically secure verification token
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        String verificationToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);

        LocalDateTime tokenExpiresAt = LocalDateTime.now().plusMinutes(TOKEN_EXPIRY_MINUTES);

        verification.setVerified(true);
        verification.setVerificationToken(verificationToken);
        verification.setVerificationTokenExpiresAt(tokenExpiresAt);
        verification.setTokenConsumed(false);

        // Invalidate the OTP hash and expiry to prevent replay or reuse
        verification.setOtpHash(null);
        verification.setOtpExpiresAt(null);
        verification.setAttemptCount(0);

        verificationRepository.save(verification);

        return SchoolAdminVerifyOtpResponse.builder()
                .success(true)
                .message("Email verified successfully.")
                .verifiedEmail(normalizedEmail)
                .verificationToken(verificationToken)
                .expiresAt(tokenExpiresAt)
                .build();
    }

    private String buildOtpEmailHtml(String otp) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <style>\n" +
                "        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; }\n" +
                "        .container { max-width: 580px; background-color: #FFFFFF; border-radius: 16px; padding: 40px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }\n" +
                "        .logo { font-size: 26px; font-weight: 800; color: #4F46E5; text-align: center; margin-bottom: 20px; }\n" +
                "        h1 { font-size: 20px; font-weight: 700; color: #0F172A; margin-bottom: 16px; text-align: center; }\n" +
                "        p { font-size: 15px; color: #475569; line-height: 24px; margin-bottom: 20px; }\n" +
                "        .otp-box { background-color: #EEF2FF; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }\n" +
                "        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4F46E5; margin: 0; }\n" +
                "        .warning { font-size: 13px; color: #64748B; background: #F1F5F9; border-radius: 8px; padding: 12px; margin-top: 20px; }\n" +
                "        .footer { text-align: center; font-size: 13px; color: #94A3B8; margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 20px; }\n" +
                "    </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <div class=\"container\">\n" +
                "        <div class=\"logo\">SpeakMate AI</div>\n" +
                "        <h1>School Admin Email Verification</h1>\n" +
                "        <p>A verification request was initiated to register this email address for a School Administrator account on SpeakMate AI. Please use the verification code below:</p>\n" +
                "        <div class=\"otp-box\">\n" +
                "            <h2 class=\"otp-code\">" + otp + "</h2>\n" +
                "        </div>\n" +
                "        <p>This code is valid for <strong>10 minutes</strong>.</p>\n" +
                "        <div class=\"warning\">\n" +
                "            <strong>Security Notice:</strong> Do not share this OTP with anyone. If you or your administrator did not initiate this request, please contact platform support immediately.\n" +
                "        </div>\n" +
                "        <div class=\"footer\">\n" +
                "            Best regards,<br/><strong>SpeakMate AI Team</strong>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</body>\n" +
                "</html>";
    }
}
