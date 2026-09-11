package com.rslsolution.speakmateai.service.impl;

import com.rslsolution.speakmateai.dto.request.SchoolRequest;
import com.rslsolution.speakmateai.dto.response.SchoolResponse;
import com.rslsolution.speakmateai.entity.School;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.entity.SchoolAdmin;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.enums.Status;
import com.rslsolution.speakmateai.repository.SchoolRepository;
import com.rslsolution.speakmateai.repository.SchoolAdminRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.EmailService;
import com.rslsolution.speakmateai.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.response.StandardDivisionResponse;
import com.rslsolution.speakmateai.entity.SchoolStandard;
import com.rslsolution.speakmateai.entity.StandardDivision;
import com.rslsolution.speakmateai.repository.SchoolStandardRepository;
import com.rslsolution.speakmateai.repository.StandardDivisionRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import com.rslsolution.speakmateai.entity.SchoolAdminEmailVerification;
import com.rslsolution.speakmateai.repository.SchoolAdminEmailVerificationRepository;
import com.rslsolution.speakmateai.exception.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

import com.rslsolution.speakmateai.dto.request.SchoolAdminSendInvitationRequest;
import com.rslsolution.speakmateai.dto.response.SchoolAdminSendInvitationResponse;
import com.rslsolution.speakmateai.service.email.EmailMessage;
import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class SchoolServiceImpl implements SchoolService {

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "!@#$%&*";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS + SPECIAL;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final SchoolRepository schoolRepository;
    private final UserRepository userRepository;
    private final SchoolAdminRepository schoolAdminRepository;
    private final SchoolStandardRepository schoolStandardRepository;
    private final StandardDivisionRepository standardDivisionRepository;
    private final SchoolAdminEmailVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final com.rslsolution.speakmateai.service.NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.rslsolution.speakmateai.service.EntityCascadeDeletionService entityCascadeDeletionService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public SchoolAdminSendInvitationResponse sendInvitation(SchoolAdminSendInvitationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Invitation request cannot be null.");
        }

        String token = request.getVerificationToken() != null ? request.getVerificationToken().trim() : "";
        if (token.isEmpty()) {
            throw new AccessDeniedException("School admin email verification token is required.");
        }

        String normalizedEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";
        if (normalizedEmail.isEmpty()) {
            throw new IllegalArgumentException("School admin email is required.");
        }

        // 1. Fetch verification record
        SchoolAdminEmailVerification verification = verificationRepository.findByVerificationToken(token)
                .orElseThrow(() -> new AccessDeniedException("Invalid verification token. Please verify the School Admin email first."));

        // 2. Validate token binding to requested email
        if (!normalizedEmail.equalsIgnoreCase(verification.getEmail())) {
            throw new AccessDeniedException("Verification token does not match the provided admin email.");
        }

        // 3. Validate verification state
        if (!verification.isVerified()) {
            throw new AccessDeniedException("School admin email has not been verified.");
        }

        // 4. Validate token has not already been consumed
        if (verification.isTokenConsumed()) {
            throw new AccessDeniedException("Verification token has already been used. Please verify the email again.");
        }

        // 5. Validate token expiry
        if (verification.getVerificationTokenExpiresAt() == null || LocalDateTime.now().isAfter(verification.getVerificationTokenExpiresAt())) {
            throw new AccessDeniedException("Verification token has expired. Please verify the email again.");
        }

        // 6. Generate secure temporary credentials
        String tempPassword = generateSecureTemporaryPassword();
        String pendingCredentialHash = passwordEncoder.encode(tempPassword);

        // 7. Update verification record (tokenConsumed remains FALSE!)
        LocalDateTime now = LocalDateTime.now();
        verification.setPendingCredentialHash(pendingCredentialHash);
        verification.setTempPassword(tempPassword);
        verification.setInvitationSent(true);
        verification.setInvitationSentAt(now);
        verificationRepository.save(verification);

        // 8. Dispatch invitation email via existing EmailService abstraction
        try {
            String adminName = (request.getAdminFirstName() != null && !request.getAdminFirstName().isBlank())
                    ? request.getAdminFirstName().trim() + (request.getAdminLastName() != null ? " " + request.getAdminLastName().trim() : "")
                    : "School Administrator";
            String schoolName = (request.getSchoolName() != null && !request.getSchoolName().isBlank())
                    ? request.getSchoolName().trim()
                    : "Your Educational Institution";
            String address = (request.getAddress() != null && !request.getAddress().isBlank())
                    ? request.getAddress().trim()
                    : "Not Specified";

            String htmlContent = buildSchoolAdminWelcomeEmailHtml(
                    adminName,
                    normalizedEmail,
                    tempPassword,
                    schoolName,
                    "PENDING REGISTRATION",
                    address,
                    "Configured in Portal"
            );
            String textContent = buildSchoolAdminWelcomeEmailText(
                    adminName,
                    normalizedEmail,
                    tempPassword,
                    schoolName,
                    "PENDING REGISTRATION",
                    address,
                    "Configured in Portal"
            );
            EmailMessage message = EmailMessage.builder()
                    .to(normalizedEmail)
                    .subject("Welcome to SpeakMate AI - School Admin Invitation & Credentials")
                    .htmlContent(htmlContent)
                    .text(textContent)
                    .html(true)
                    .senderName("SpeakMate AI")
                    .build();
            emailService.sendEmail(message);
        } catch (Exception e) {
            System.err.println("[SchoolAdminInvitation] Email provider dispatch warning for " + normalizedEmail + ": " + e.getMessage());
        }

        return SchoolAdminSendInvitationResponse.builder()
                .success(true)
                .message("Invitation and login credentials sent successfully.")
                .email(normalizedEmail)
                .invitationSentAt(now)
                .build();
    }

    private String generateSecureTemporaryPassword() {
        StringBuilder sb = new StringBuilder(12);
        sb.append(UPPER.charAt(SECURE_RANDOM.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(SECURE_RANDOM.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(SECURE_RANDOM.nextInt(DIGITS.length())));
        sb.append(SPECIAL.charAt(SECURE_RANDOM.nextInt(SPECIAL.length())));
        for (int i = 4; i < 12; i++) {
            sb.append(ALL_CHARS.charAt(SECURE_RANDOM.nextInt(ALL_CHARS.length())));
        }
        char[] chars = sb.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = SECURE_RANDOM.nextInt(i + 1);
            char tmp = chars[i];
            chars[i] = chars[j];
            chars[j] = tmp;
        }
        return new String(chars);
    }

    private String buildSchoolAdminWelcomeEmailHtml(
            String adminName,
            String email,
            String tempPassword,
            String schoolName,
            String schoolCode,
            String address,
            String contactPhone) {
        String base = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        String encodedEmail = "";
        try {
            encodedEmail = java.net.URLEncoder.encode(email != null ? email.trim() : "", java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception ignored) {}
        String loginUrl = base + "/school-admin/login?email=" + encodedEmail + "&firstTime=true";

        String safeAdminName = org.springframework.web.util.HtmlUtils.htmlEscape(adminName != null && !adminName.isBlank() ? adminName : "School Administrator");
        String safeEmail = org.springframework.web.util.HtmlUtils.htmlEscape(email != null ? email : "");
        String safePassword = org.springframework.web.util.HtmlUtils.htmlEscape(tempPassword != null ? tempPassword : "");
        String safeSchoolName = org.springframework.web.util.HtmlUtils.htmlEscape(schoolName != null && !schoolName.isBlank() ? schoolName : "SpeakMate Partner School");
        String safeSchoolCode = org.springframework.web.util.HtmlUtils.htmlEscape(schoolCode != null && !schoolCode.isBlank() ? schoolCode : "");
        String safeAddress = org.springframework.web.util.HtmlUtils.htmlEscape(address != null && !address.isBlank() ? address : "");
        String safePhone = org.springframework.web.util.HtmlUtils.htmlEscape(contactPhone != null && !contactPhone.isBlank() ? contactPhone : "");

        return "<!DOCTYPE html>\n"
                + "<html lang='en'>\n"
                + "<head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>School Admin Portal Access</title>\n"
                + "<style>\n"
                + "  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; color: #1e293b; }\n"
                + "  .wrapper { width: 100%; background-color: #f1f5f9; padding: 32px 16px; box-sizing: border-box; }\n"
                + "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }\n"
                + "  .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 36px 28px; text-align: center; color: #ffffff; }\n"
                + "  .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }\n"
                + "  .header-badge { display: inline-block; margin-top: 10px; background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.35); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #ffffff; }\n"
                + "  .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #334155; }\n"
                + "  .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 12px; }\n"
                + "  .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.75px; color: #64748b; margin: 24px 0 10px 0; }\n"
                + "  .info-table { width: 100%; border-collapse: collapse; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }\n"
                + "  .info-table td { padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }\n"
                + "  .info-table tr:last-child td { border-bottom: none; }\n"
                + "  .label-col { width: 35%; color: #64748b; font-weight: 500; }\n"
                + "  .value-col { color: #0f172a; font-weight: 600; }\n"
                + "  .cred-table { width: 100%; border-collapse: collapse; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }\n"
                + "  .cred-table td { padding: 10px 16px; font-size: 14px; border-bottom: 1px solid #f1f5f9; }\n"
                + "  .cred-table tr:last-child td { border-bottom: none; }\n"
                + "  .cred-val { font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700; color: #0f172a; background: #e2e8f0; padding: 4px 10px; border-radius: 4px; word-break: break-all; }\n"
                + "  .security-box { background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 16px; border-radius: 0 6px 6px 0; margin-bottom: 28px; font-size: 13.5px; color: #1e40af; line-height: 1.5; }\n"
                + "  .tab-btn-container { text-align: center; margin: 32px 0; }\n"
                + "  .tab-button { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; padding: 14px 34px; border-radius: 8px; font-weight: 700; font-size: 16px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); }\n"
                + "  .fallback-url { font-size: 12px; color: #64748b; word-break: break-all; text-align: center; margin-top: 15px; line-height: 1.4; }\n"
                + "  .fallback-url a { color: #2563eb; text-decoration: underline; }\n"
                + "  .footer { background-color: #f8fafc; padding: 22px 28px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }\n"
                + "  .footer p { margin: 4px 0; }\n"
                + "</style>\n"
                + "</head>\n"
                + "<body>\n"
                + "<div class='wrapper'>\n"
                + "  <div class='container'>\n"
                + "    <div class='header'>\n"
                + "      <h1>SpeakMate AI</h1>\n"
                + "      <div class='header-badge'>School Administrator Portal Access</div>\n"
                + "    </div>\n"
                + "    <div class='content'>\n"
                + "      <div class='greeting'>Hello " + safeAdminName + ",</div>\n"
                + "      <p>Your School Administrator account for <strong>" + safeSchoolName + "</strong> has been created on SpeakMate AI.</p>\n"
                + "      <p>Your administrator portal provides role-isolated access to manage your school's teachers, classrooms, students, and speaking performance metrics.</p>\n"
                + "      <div class='section-title'>Institutional Details</div>\n"
                + "      <table class='info-table'>\n"
                + "        <tr><td class='label-col'>School Name:</td><td class='value-col'>" + safeSchoolName + "</td></tr>\n"
                + "        <tr><td class='label-col'>School Code:</td><td class='value-col'><span style='background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: 700; font-size: 14px;'>" + safeSchoolCode + "</span></td></tr>\n"
                + "        <tr><td class='label-col'>Address:</td><td class='value-col'>" + safeAddress + "</td></tr>\n"
                + "        <tr><td class='label-col'>Contact Phone:</td><td class='value-col'>" + safePhone + "</td></tr>\n"
                + "      </table>\n"
                + "      <div class='section-title'>Login Credentials</div>\n"
                + "      <table class='cred-table'>\n"
                + "        <tr><td class='label-col'>Portal Role:</td><td class='value-col'>School Administrator</td></tr>\n"
                + "        <tr><td class='label-col'>Login Email:</td><td class='value-col' style='font-family: monospace; font-weight: 700; font-size: 14px; color: #0f172a;'>" + safeEmail + "</td></tr>\n"
                + "        <tr><td class='label-col'>Temporary Password:</td><td class='value-col'><span class='cred-val'>" + safePassword + "</span></td></tr>\n"
                + "      </table>\n"
                + "      <div class='security-box'>\n"
                + "        <strong>Important Security Notice:</strong><br/>\n"
                + "        The password provided above is <strong>temporary</strong>. When you click the login portal button below, you will be guided to enter your temporary password and create your <strong>permanent password</strong> before signing into your dashboard.\n"
                + "      </div>\n"
                + "      <div class='tab-btn-container'>\n"
                + "        <a href='" + loginUrl + "' class='tab-button' style='color: #ffffff !important; text-decoration: none;'>Log In to School Admin Portal &rarr;</a>\n"
                + "      </div>\n"
                + "      <div class='fallback-url'>\n"
                + "        If the button above does not work, copy and paste this link into your browser:<br/>\n"
                + "        <a href='" + loginUrl + "'>" + loginUrl + "</a>\n"
                + "      </div>\n"
                + "    </div>\n"
                + "    <div class='footer'>\n"
                + "      <p><strong>SpeakMate AI</strong> &bull; Institutional English Learning Management</p>\n"
                + "      <p>Confidential: This message contains sensitive credentials intended only for " + safeEmail + ".</p>\n"
                + "      <p>&copy; " + java.time.Year.now().getValue() + " SpeakMate AI. All rights reserved.</p>\n"
                + "    </div>\n"
                + "  </div>\n"
                + "</div>\n"
                + "</body>\n"
                + "</html>";
    }

    private String buildSchoolAdminWelcomeEmailText(
            String adminName,
            String email,
            String tempPassword,
            String schoolName,
            String schoolCode,
            String address,
            String contactPhone) {
        String base = (frontendUrl != null && !frontendUrl.isBlank()) ? frontendUrl.trim() : "http://localhost:5173";
        if (base.endsWith("/")) {
            base = base.substring(0, base.length() - 1);
        }
        String encodedEmail = "";
        try {
            encodedEmail = java.net.URLEncoder.encode(email != null ? email.trim() : "", java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception ignored) {}
        String loginUrl = base + "/school-admin/login?email=" + encodedEmail + "&firstTime=true";

        return "Welcome to SpeakMate AI!\n\n"
                + "Hello " + (adminName != null ? adminName : "School Administrator") + ",\n\n"
                + "Your School Administrator account has been configured.\n\n"
                + "--- Institutional Details ---\n"
                + "School Name:    " + (schoolName != null ? schoolName : "") + "\n"
                + "School Code:    " + (schoolCode != null ? schoolCode : "") + "\n"
                + "School Address: " + (address != null ? address : "") + "\n"
                + "Contact Phone:  " + (contactPhone != null ? contactPhone : "") + "\n\n"
                + "--- Login Credentials ---\n"
                + "Role:               School Administrator\n"
                + "Login Email:        " + email + "\n"
                + "Temporary Password: " + tempPassword + "\n\n"
                + "--- Portal Access Link ---\n"
                + loginUrl + "\n\n"
                + "Security Notice: The password provided is temporary. Upon clicking the portal link, you will be guided to enter your temporary password and create your permanent password before signing in.\n\n"
                + "SpeakMate AI Team";
    }

    private String buildInvitationEmailHtml(String email, String tempPassword) {
        return buildSchoolAdminWelcomeEmailHtml(
                "School Administrator",
                email,
                tempPassword,
                "Your Educational Institution",
                "",
                "",
                ""
        );
    }

    private String buildInvitationEmailText(String email, String tempPassword) {
        return buildSchoolAdminWelcomeEmailText(
                "School Administrator",
                email,
                tempPassword,
                "Your Educational Institution",
                "",
                "",
                ""
        );
    }

    @Override
    @Transactional
    public SchoolResponse createSchool(SchoolRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("School request cannot be null");
        }

        // 1. Mandatory School Admin Email Verification Validation (BEFORE any entity creation or persistence)
        String token = request.getVerificationToken() != null ? request.getVerificationToken().trim() : "";
        if (token.isEmpty()) {
            throw new AccessDeniedException("School admin email verification token is required.");
        }

        String normalizedAdminEmail = request.getAdminEmail() != null ? request.getAdminEmail().trim().toLowerCase() : "";
        if (normalizedAdminEmail.isEmpty()) {
            throw new IllegalArgumentException("Admin email is required");
        }

        // Fetch verification record with pessimistic lock to prevent concurrent double-submission
        SchoolAdminEmailVerification verification = verificationRepository.findByVerificationTokenWithLock(token)
                .orElseThrow(() -> new AccessDeniedException("Invalid verification token. Please verify the School Admin email first."));

        // Validate token binding to the same normalized admin email
        if (!normalizedAdminEmail.equalsIgnoreCase(verification.getEmail())) {
            throw new AccessDeniedException("Verification token does not match the provided admin email.");
        }

        // Validate verification state
        if (!verification.isVerified()) {
            throw new AccessDeniedException("School admin email has not been verified.");
        }

        // Validate token is not already consumed (prevents replay / duplicate use)
        if (verification.isTokenConsumed()) {
            throw new AccessDeniedException("Verification token has already been used. Please verify the email again.");
        }

        // Validate token expiration
        if (verification.getVerificationTokenExpiresAt() == null || LocalDateTime.now().isAfter(verification.getVerificationTokenExpiresAt())) {
            throw new AccessDeniedException("Verification token has expired. Please verify the email again.");
        }

        if (schoolRepository.existsByName(request.getSchoolName())) {
            throw new RuntimeException("School with this name already exists");
        }

        if (userRepository.existsByEmail(normalizedAdminEmail)) {
            throw new RuntimeException("Admin email is already in use");
        }

        String normalizedContactPhone = com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getContactPhone(), "Contact phone");

        // 1. Create School
        School school = School.builder()
                .name(request.getSchoolName())
                .schoolName(request.getSchoolName())
                .schoolCode("SCH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .address(request.getAddress())
                .contactPhone(normalizedContactPhone)
                .active(true)
                .build();
        school = schoolRepository.save(school);

        // 2. Create School Admin
        String rawTempPassword = verification.getTempPassword();
        String passwordHash;
        if (rawTempPassword != null && !rawTempPassword.trim().isEmpty()) {
            passwordHash = verification.getPendingCredentialHash() != null && !verification.getPendingCredentialHash().trim().isEmpty()
                    ? verification.getPendingCredentialHash()
                    : passwordEncoder.encode(rawTempPassword);
        } else {
            rawTempPassword = generateSecureTemporaryPassword();
            passwordHash = passwordEncoder.encode(rawTempPassword);
        }

        String verificationToken = UUID.randomUUID().toString();
        SchoolAdmin adminUser = SchoolAdmin.builder()
                .firstName(request.getAdminFirstName())
                .lastName(request.getAdminLastName())
                .email(normalizedAdminEmail)
                .phone(normalizedContactPhone)
                .password(passwordHash)
                .role(Role.SCHOOL_ADMIN)
                .schoolId(school.getId())
                .status(Status.ACTIVE)
                .active(true)
                .emailVerified(true)
                .welcomeCompleted(false)
                .emailVerificationToken(verificationToken)
                .build();
        adminUser = schoolAdminRepository.save(adminUser);

        // 3. Update verification record and consume token within the same transaction (single-use)
        LocalDateTime now = LocalDateTime.now();
        verification.setTempPassword(rawTempPassword);
        verification.setPendingCredentialHash(passwordHash);
        verification.setInvitationSent(true);
        verification.setInvitationSentAt(now);
        verification.setTokenConsumed(true);
        verificationRepository.save(verification);

        // 4. Send Official School Admin Registered & Credentials Email (STRICTLY HTML)
        try {
            String adminFullName = ((adminUser.getFirstName() != null ? adminUser.getFirstName().trim() : "")
                    + (adminUser.getLastName() != null && !adminUser.getLastName().isBlank() ? " " + adminUser.getLastName().trim() : "")).trim();
            if (adminFullName.isEmpty()) {
                adminFullName = "School Administrator";
            }

            String schoolAddress = (school.getAddress() != null && !school.getAddress().isBlank())
                    ? school.getAddress().trim()
                    : ((request.getAddress() != null && !request.getAddress().isBlank()) ? request.getAddress().trim() : "");
            String schoolContactPhone = (school.getContactPhone() != null && !school.getContactPhone().isBlank())
                    ? school.getContactPhone().trim()
                    : normalizedContactPhone;

            String htmlContent = buildSchoolAdminWelcomeEmailHtml(
                    adminFullName,
                    adminUser.getEmail(),
                    rawTempPassword,
                    school.getName(),
                    school.getSchoolCode(),
                    schoolAddress,
                    schoolContactPhone
            );
            String textContent = buildSchoolAdminWelcomeEmailText(
                    adminFullName,
                    adminUser.getEmail(),
                    rawTempPassword,
                    school.getName(),
                    school.getSchoolCode(),
                    schoolAddress,
                    schoolContactPhone
            );

            EmailMessage message = EmailMessage.builder()
                    .to(adminUser.getEmail())
                    .subject("Welcome to SpeakMate AI - School Admin Credentials for " + school.getName())
                    .htmlContent(htmlContent)
                    .text(textContent)
                    .html(true)
                    .senderName("SpeakMate AI")
                    .build();
            emailService.sendEmail(message);
        } catch (Exception e) {
            // Log the error but don't fail the transaction, or handle accordingly.
            System.err.println("Failed to send school admin credentials email: " + e.getMessage());
        }

        try {
            if (notificationService != null) {
                notificationService.notifyAdmins("New School Registered", "School \"" + school.getName() + "\" has been registered with code " + school.getSchoolCode() + ".", com.rslsolution.speakmateai.enums.NotificationType.SCHOOL_CREATED, school.getId(), "SCHOOL");
                notificationService.notifyAdmins("New School Admin Created", "School Admin " + adminUser.getFirstName() + " " + adminUser.getLastName() + " has been configured for " + school.getName() + ".", com.rslsolution.speakmateai.enums.NotificationType.USER_CREATED, adminUser.getId(), "USER");
                notificationService.sendNotification(adminUser.getEmail(), "Welcome to SpeakMate AI", "You have been registered as the School Admin for " + school.getName() + ".", com.rslsolution.speakmateai.enums.NotificationType.USER_CREATED, adminUser.getId(), "USER");
            }
        } catch (Exception e) {
            System.err.println("Failed to dispatch notifications: " + e.getMessage());
        }

        return mapToResponse(school, adminUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SchoolResponse> getAllSchools() {
        List<School> schools = schoolRepository.findAll();
        if (schools.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> schoolIds = schools.stream().map(School::getId).collect(Collectors.toList());
        List<SchoolStandard> allStandards = Collections.emptyList();
        try {
            allStandards = schoolStandardRepository.findBySchoolIdIn(schoolIds);
        } catch (Exception ignored) {}

        Map<Long, List<SchoolStandard>> standardsBySchoolId = allStandards.stream()
                .filter(ss -> ss.getSchool() != null && ss.getSchool().getId() != null)
                .collect(Collectors.groupingBy(ss -> ss.getSchool().getId()));

        List<Long> standardIds = allStandards.stream().map(SchoolStandard::getId).collect(Collectors.toList());
        Map<Long, List<String>> divisionsByStandardId = new HashMap<>();
        if (!standardIds.isEmpty()) {
            try {
                List<StandardDivision> allDivisions = standardDivisionRepository.findBySchoolStandardIdIn(standardIds);
                divisionsByStandardId = allDivisions.stream()
                        .filter(sd -> sd.getSchoolStandard() != null && sd.getSchoolStandard().getId() != null)
                        .collect(Collectors.groupingBy(
                                sd -> sd.getSchoolStandard().getId(),
                                Collectors.mapping(StandardDivision::getDivision, Collectors.toList())
                        ));
            } catch (Exception ignored) {}
        }

        Map<Long, List<String>> finalDivisionsByStandardId = divisionsByStandardId;

        Map<Long, User> adminBySchoolId = new HashMap<>();
        try {
            List<User> schoolAdmins = userRepository.findByRole(com.rslsolution.speakmateai.enums.Role.SCHOOL_ADMIN);
            if (schoolAdmins != null) {
                for (User u : schoolAdmins) {
                    if (u.getSchoolId() != null && !adminBySchoolId.containsKey(u.getSchoolId())) {
                        adminBySchoolId.put(u.getSchoolId(), u);
                    }
                }
            }
        } catch (Exception ignored) {}

        return schools.stream().map(school -> {
            String code = school.getSchoolCode();
            if (code == null || code.trim().isEmpty()) {
                code = "SCH-" + String.format("%04d", school.getId());
            }

            List<SchoolStandard> standards = standardsBySchoolId.getOrDefault(school.getId(), Collections.emptyList());
            int stdCount = standards.size();
            int divCount = 0;
            List<StandardDivisionResponse> structure = new ArrayList<>();

            if (!standards.isEmpty()) {
                for (SchoolStandard standard : standards) {
                    List<String> divNames = finalDivisionsByStandardId.getOrDefault(standard.getId(), Collections.singletonList("A"));
                    divCount += divNames.size();
                    structure.add(StandardDivisionResponse.builder()
                            .standard(standard.getStandard())
                            .divisions(divNames)
                            .build());
                }
            } else {
                stdCount = 10;
                divCount = 10;
                for (int i = 1; i <= 10; i++) {
                    structure.add(StandardDivisionResponse.builder()
                            .standard(String.valueOf(i))
                            .divisions(Collections.singletonList("A"))
                            .build());
                }
            }

            User adminUser = adminBySchoolId.get(school.getId());
            String adminName = adminUser != null ? ((adminUser.getFirstName() != null ? adminUser.getFirstName() : "") + " " + (adminUser.getLastName() != null ? adminUser.getLastName() : "")).trim() : null;
            String adminEmail = adminUser != null ? adminUser.getEmail() : null;
            String adminPhone = adminUser != null ? adminUser.getPhone() : null;
            Long adminId = adminUser != null ? adminUser.getId() : null;

            return SchoolResponse.builder()
                    .id(school.getId())
                    .name(school.getName())
                    .schoolCode(code)
                    .address(school.getAddress())
                    .contactPhone(school.getContactPhone())
                    .active(school.isActive())
                    .createdAt(school.getCreatedAt())
                    .adminId(adminId)
                    .adminEmail(adminEmail)
                    .adminName(adminName)
                    .adminPhone(adminPhone)
                    .standardsCount(stdCount)
                    .totalDivisions(divCount)
                    .divisionCount(divCount)
                    .academicStructure(structure)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public SchoolResponse getSchoolById(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
        return mapToResponse(school, null);
    }

    @Override
    public SchoolResponse updateSchool(Long id, SchoolRequest request) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found with id: " + id));

        String normalizedContactPhone = com.rslsolution.speakmateai.util.PhoneNumberUtil.validateAndNormalize(request.getContactPhone(), "Contact phone");

        school.setName(request.getSchoolName());
        school.setSchoolName(request.getSchoolName());
        school.setAddress(request.getAddress());
        school.setContactPhone(normalizedContactPhone);
        if (request.getAdminEmail() != null && !request.getAdminEmail().isBlank()) {
            school.setEmail(request.getAdminEmail().trim());
        }

        School updatedSchool = schoolRepository.save(school);
        return mapToResponse(updatedSchool, null);
    }

    @Override
    @Transactional
    public SchoolResponse activateSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
        school.setActive(true);
        School updatedSchool = schoolRepository.save(school);

        if (notificationService != null) {
            try {
                notificationService.notifyAdmins(
                        "School Activated",
                        "School " + school.getName() + " has been activated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.SCHOOL_CREATED,
                        school.getId(),
                        "SCHOOL"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin notification on activate school: " + e.getMessage());
            }

            try {
                notificationService.notifySchoolAdmins(
                        school.getId(),
                        "School Activated",
                        "School " + school.getName() + " has been activated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.SCHOOL_CREATED,
                        school.getId(),
                        "SCHOOL"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch school admin notification on activate school: " + e.getMessage());
            }
        }

        return mapToResponse(updatedSchool, null);
    }

    @Override
    @Transactional
    public SchoolResponse deactivateSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
        school.setActive(false);
        School updatedSchool = schoolRepository.save(school);

        if (notificationService != null) {
            try {
                notificationService.notifyAdmins(
                        "School Deactivated",
                        "School " + school.getName() + " has been deactivated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.SCHOOL_CREATED,
                        school.getId(),
                        "SCHOOL"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch admin notification on deactivate school: " + e.getMessage());
            }

            try {
                notificationService.notifySchoolAdmins(
                        school.getId(),
                        "School Deactivated",
                        "School " + school.getName() + " has been deactivated by Super Admin.",
                        com.rslsolution.speakmateai.enums.NotificationType.SCHOOL_CREATED,
                        school.getId(),
                        "SCHOOL"
                );
            } catch (Exception e) {
                System.err.println("Failed to dispatch school admin notification on deactivate school: " + e.getMessage());
            }
        }

        return mapToResponse(updatedSchool, null);
    }

    @Override
    @Transactional
    public void deleteSchool(Long id) {
        School school = schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
        if (entityCascadeDeletionService != null) {
            entityCascadeDeletionService.deleteSchoolCascade(id);
        } else {
            schoolRepository.delete(school);
        }
    }

    private SchoolResponse mapToResponse(School school, User adminUser) {
        String code = school.getSchoolCode();
        if (code == null || code.trim().isEmpty()) {
            code = "SCH-" + String.format("%04d", school.getId());
            school.setSchoolCode(code);
            try {
                schoolRepository.save(school);
            } catch (Exception ignored) {}
        }

        List<SchoolStandard> standards = null;
        try {
            standards = schoolStandardRepository.findBySchoolId(school.getId());
        } catch (Exception ignored) {}

        // If the school has no configured standards in the database, automatically initialize default standards (1st - 10th with division 'A')
        if (standards == null || standards.isEmpty()) {
            standards = new ArrayList<>();
            for (int i = 1; i <= 10; i++) {
                String stdName = String.valueOf(i);
                try {
                    SchoolStandard ss = SchoolStandard.builder()
                            .school(school)
                            .standard(stdName)
                            .build();
                    SchoolStandard saved = schoolStandardRepository.save(ss);
                    if (saved != null) {
                        try {
                            standardDivisionRepository.save(StandardDivision.builder()
                                    .schoolStandard(saved)
                                    .division("A")
                                    .build());
                        } catch (Exception ignored) {}
                        standards.add(saved);
                    }
                } catch (Exception ignored) {
                }
            }
        }

        int stdCount = standards.size();
        int divCount = 0;
        List<StandardDivisionResponse> structure = new ArrayList<>();
        List<Long> stdIds = standards.stream()
                .filter(Objects::nonNull)
                .map(SchoolStandard::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        Map<Long, List<String>> divMap = new HashMap<>();
        if (!stdIds.isEmpty()) {
            try {
                List<StandardDivision> divs = standardDivisionRepository.findBySchoolStandardIdIn(stdIds);
                if (divs != null) {
                    divMap = divs.stream()
                            .filter(sd -> sd != null && sd.getSchoolStandard() != null && sd.getSchoolStandard().getId() != null)
                            .collect(Collectors.groupingBy(
                                    sd -> sd.getSchoolStandard().getId(),
                                    Collectors.mapping(StandardDivision::getDivision, Collectors.toList())
                            ));
                }
            } catch (Exception ignored) {}
        }

        for (SchoolStandard standard : standards) {
            if (standard == null) continue;
            List<String> divNames = standard.getId() != null
                    ? divMap.getOrDefault(standard.getId(), Collections.singletonList("A"))
                    : Collections.singletonList("A");
            divCount += divNames.size();
            structure.add(StandardDivisionResponse.builder()
                    .standard(standard.getStandard())
                    .divisions(divNames)
                    .build());
        }

        if (adminUser == null && school.getId() != null) {
            try {
                List<User> admins = userRepository.findBySchoolIdAndRole(school.getId(), com.rslsolution.speakmateai.enums.Role.SCHOOL_ADMIN);
                if (admins != null && !admins.isEmpty()) {
                    adminUser = admins.get(0);
                }
            } catch (Exception ignored) {}
        }

        String adminName = adminUser != null ? ((adminUser.getFirstName() != null ? adminUser.getFirstName() : "") + " " + (adminUser.getLastName() != null ? adminUser.getLastName() : "")).trim() : null;
        String adminPhone = adminUser != null ? adminUser.getPhone() : null;

        return SchoolResponse.builder()
                .id(school.getId())
                .name(school.getName())
                .schoolCode(code)
                .address(school.getAddress())
                .contactPhone(school.getContactPhone())
                .active(school.isActive())
                .createdAt(school.getCreatedAt())
                .adminId(adminUser != null ? adminUser.getId() : null)
                .adminEmail(adminUser != null ? adminUser.getEmail() : null)
                .adminName(adminName)
                .adminPhone(adminPhone)
                .standardsCount(stdCount)
                .totalDivisions(divCount)
                .divisionCount(divCount)
                .academicStructure(structure)
                .build();
    }
}
