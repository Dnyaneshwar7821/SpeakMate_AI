package com.rslsolution.speakmateai.service.impl;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rslsolution.speakmateai.dto.request.DeleteAccountRequest;
import com.rslsolution.speakmateai.dto.request.ForgotPasswordRequest;
import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.request.RegisterRequest;
import com.rslsolution.speakmateai.dto.request.ResetPasswordRequest;
import com.rslsolution.speakmateai.dto.request.SendDeleteAccountOtpRequest;
import com.rslsolution.speakmateai.dto.request.SendRegistrationOtpRequest;
import com.rslsolution.speakmateai.dto.request.VerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.dto.response.UserResponse;
import com.rslsolution.speakmateai.dto.response.VerifyOtpResponse;
import com.rslsolution.speakmateai.entity.Onboarding;
import com.rslsolution.speakmateai.entity.Progress;
import com.rslsolution.speakmateai.entity.Settings;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.DuplicateEmailException;
import com.rslsolution.speakmateai.exception.InvalidCredentialsException;
import com.rslsolution.speakmateai.exception.UserNotFoundException;
import com.rslsolution.speakmateai.repository.OnboardingRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.VocabularyRepository;
import com.rslsolution.speakmateai.repository.ChatSessionRepository;
import com.rslsolution.speakmateai.repository.ChatMessageRepository;
import com.rslsolution.speakmateai.repository.LessonProgressRepository;
import com.rslsolution.speakmateai.repository.NotificationRepository;
import com.rslsolution.speakmateai.repository.SpeakingSessionRepository;
import com.rslsolution.speakmateai.repository.GrammarHistoryRepository;
import com.rslsolution.speakmateai.service.UserService;
import com.rslsolution.speakmateai.util.JwtUtil;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

@Service
@Transactional
public class UserServiceImpl implements UserService {

	@jakarta.persistence.PersistenceContext
	private jakarta.persistence.EntityManager entityManager;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private ProgressRepository progressRepository;

	@Autowired
	private SettingsRepository settingsRepository;

	@Autowired
	private OnboardingRepository onboardingRepository;

	@Autowired(required = false)
	private VocabularyRepository vocabularyRepository;

	@Autowired(required = false)
	private ChatSessionRepository chatSessionRepository;

	@Autowired(required = false)
	private ChatMessageRepository chatMessageRepository;

	@Autowired(required = false)
	private LessonProgressRepository lessonProgressRepository;

	@Autowired(required = false)
	private NotificationRepository notificationRepository;

	@Autowired(required = false)
	private SpeakingSessionRepository speakingSessionRepository;

	@Autowired(required = false)
	private GrammarHistoryRepository grammarHistoryRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtUtil jwtUtil;

	@Autowired(required = false)
	private JavaMailSender mailSender;

	private static final java.util.Map<String, RegistrationOtpDetails> registrationOtpMap = new java.util.concurrent.ConcurrentHashMap<>();
	private static final java.util.Map<String, RegistrationOtpDetails> deleteAccountOtpMap = new java.util.concurrent.ConcurrentHashMap<>();

	private static class RegistrationOtpDetails {
		private final String otp;
		private final LocalDateTime expiry;

		public RegistrationOtpDetails(String otp, LocalDateTime expiry) {
			this.otp = otp;
			this.expiry = expiry;
		}

		public String getOtp() { return otp; }
		public LocalDateTime getExpiry() { return expiry; }
	}

	@Override
	public void sendRegistrationOtp(SendRegistrationOtpRequest request) {

		if (userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateEmailException("Email is already registered. Please sign in instead.");
		}

		String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
		registrationOtpMap.put(request.getEmail().toLowerCase(), new RegistrationOtpDetails(otp, LocalDateTime.now().plusMinutes(10)));

		System.out.println("[Registration OTP Generated] OTP for " + request.getEmail() + " is: " + otp);

		try {
			if (mailSender != null) {
				MimeMessage message = mailSender.createMimeMessage();
				MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
				helper.setFrom("dnyaneshwaralgule2003@gmail.com", "SpeakMateAI");
				helper.setTo(request.getEmail());
				helper.setSubject("Verify Your Email - SpeakMateAI Registration");

				String htmlContent = String.format(
					"<!DOCTYPE html>\n" +
					"<html>\n" +
					"<head>\n" +
					"    <style>\n" +
					"        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; }\n" +
					"        .container { max-width: 600px; background-color: #FFFFFF; border-radius: 16px; padding: 40px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }\n" +
					"        .logo { font-size: 28px; font-weight: 900; color: #4F46E5; text-align: center; margin-bottom: 24px; }\n" +
					"        h1 { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 16px; text-align: center; }\n" +
					"        p { font-size: 15px; color: #64748B; line-height: 24px; margin-bottom: 24px; }\n" +
					"        .otp-box { background-color: #EEF2FF; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }\n" +
					"        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4F46E5; margin: 0; }\n" +
					"        .footer { text-align: center; font-size: 13px; color: #94A3B8; margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 20px; }\n" +
					"    </style>\n" +
					"</head>\n" +
					"<body>\n" +
					"    <div class=\"container\">\n" +
					"        <div class=\"logo\">SpeakMateAI</div>\n" +
					"        <h1>Verify Your Email Address</h1>\n" +
					"        <p>Thank you for signing up for SpeakMateAI! Please use the 6-digit Verification Code below to complete your registration:</p>\n" +
					"        <div class=\"otp-box\">\n" +
					"            <h2 class=\"otp-code\">%s</h2>\n" +
					"        </div>\n" +
					"        <p>This code is valid for <strong>10 minutes</strong>. If you did not request this registration, please ignore this email.</p>\n" +
					"        <div class=\"footer\">\n" +
					"            Welcome aboard,<br/><strong>SpeakMateAI Team</strong>\n" +
					"        </div>\n" +
					"    </div>\n" +
					"</body>\n" +
					"</html>", otp);

				helper.setText(htmlContent, true);
				mailSender.send(message);
				System.out.println("[Registration Email Sent] OTP sent to: " + request.getEmail());
			} else {
				System.out.println("[SMTP Offline] MailSender bean not present. Registration OTP for " + request.getEmail() + " is: " + otp);
			}
		} catch (Exception ex) {
			System.err.println("[SMTP Error] Failed to send registration OTP email: " + ex.getMessage());
			System.out.println("[Fallback Log] Registration OTP for " + request.getEmail() + " is: " + otp);
		}
	}

	@Override
	public UserResponse register(RegisterRequest request) {

		if (userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateEmailException("Email already exists.");
		}

		if (request.getConfirmPassword() == null || !request.getConfirmPassword().equals(request.getPassword())) {
			throw new IllegalArgumentException("Passwords do not match.");
		}

		// Verify registration OTP
		RegistrationOtpDetails otpDetails = registrationOtpMap.get(request.getEmail().toLowerCase());
		if (otpDetails == null || request.getOtp() == null || !otpDetails.getOtp().equals(request.getOtp().trim())) {
			throw new IllegalArgumentException("Invalid OTP verification code. Please check your email and try again.");
		}

		if (otpDetails.getExpiry().isBefore(LocalDateTime.now())) {
			throw new IllegalArgumentException("OTP verification code has expired. Please request a new code.");
		}

		validatePasswordStrength(request.getPassword());

		User user = User.builder().firstName(request.getFirstName()).lastName(request.getLastName())
				.email(request.getEmail()).password(passwordEncoder.encode(request.getPassword())).role(Role.USER)
				.active(true).welcomeCompleted(false).onboardingCompleted(false)
				.authProvider("LOCAL").build();

		User savedUser = userRepository.save(user);

		// Remove OTP after successful registration
		registrationOtpMap.remove(request.getEmail().toLowerCase());

		// ── Auto-provision all default user-related records so that dashboard APIs
		// ── always return valid data for a brand-new user (never 404).
		provisionDefaultUserData(savedUser);

		return mapToUserResponse(savedUser);
	}

	/**
	 * Creates default Progress, Settings, and Onboarding records for a newly
	 * registered user. This is idempotent — it only inserts if the record does not
	 * already exist, preventing duplicates if called more than once.
	 */
	private void provisionDefaultUserData(User user) {

		// Default Progress: XP=0, Level=1, all streaks and counters at zero.
		if (!progressRepository.findByUser(user).isPresent()) {
			Progress defaultProgress = Progress.builder()
					.user(user)
					.xp(0)
					.level(1)
					.currentStreak(0)
					.longestStreak(0)
					.totalPracticeMinutes(0)
					.totalSpeakingSessions(0)
					.totalGrammarChecks(0)
					.totalVocabularyWords(0)
					.build();
			progressRepository.save(defaultProgress);
		}

		// Default Settings: all @Builder.Default values on the entity are used.
		if (!settingsRepository.findByUser(user).isPresent()) {
			Settings defaultSettings = Settings.builder()
					.user(user)
					.build();
			settingsRepository.save(defaultSettings);
		}

		// Default Onboarding: sensible defaults, marked as not yet completed.
		if (!onboardingRepository.findByUser(user).isPresent()) {
			Onboarding defaultOnboarding = Onboarding.builder()
					.user(user)
					.englishLevel("Beginner")
					.learningGoal("Improve English speaking skills")
					.dailyGoalMinutes(15)
					.nativeLanguage("English")
					.preferredLearningTime("Morning")
					.interests("General")
					.onboardingCompleted(false)
					.build();
			onboardingRepository.save(defaultOnboarding);
		}
	}

	@Override
	public AuthResponse login(LoginRequest request) {

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new InvalidCredentialsException("Invalid email"));

		if (!user.isActive()) {
			throw new InvalidCredentialsException("Inactive account");
		}

		if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
			throw new InvalidCredentialsException("Incorrect password");
		}

		String token = jwtUtil.generateToken(user.getEmail());

		return AuthResponse.builder().token(token).user(mapToUserResponse(user)).build();
	}

	@Override
	public UserResponse getCurrentUser() {

		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
			throw new UserNotFoundException("User not authenticated");
		}

		User user = userRepository.findByEmail(authentication.getName())
				.orElseThrow(() -> new UserNotFoundException("User not found"));

		return mapToUserResponse(user);
	}

	@Override
	public void forgotPassword(ForgotPasswordRequest request) {
		String cleanEmail = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : "";

		User user = userRepository.findByEmail(cleanEmail)
				.orElseGet(() -> userRepository.findAll().stream()
						.filter(u -> u.getEmail() != null && u.getEmail().trim().equalsIgnoreCase(cleanEmail))
						.findFirst()
						.orElseThrow(() -> new IllegalArgumentException("No registered account found with email: " + cleanEmail)));

		String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
		user.setResetOtp(otp);
		user.setResetOtpExpiry(LocalDateTime.now().plusMinutes(10));
		userRepository.save(user);

		System.out.println("[Forgot Password OTP Generated] OTP for " + user.getEmail() + " is: " + otp);

		// Send branded HTML OTP email using Spring Boot Mail
		try {
			if (mailSender != null) {
				MimeMessage message = mailSender.createMimeMessage();
				MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
				helper.setFrom("dnyaneshwaralgule2003@gmail.com", "SpeakMateAI");
				helper.setTo(user.getEmail());
				helper.setSubject("Your SpeakMateAI Password Reset OTP");
				
				String htmlContent = String.format(
					"<!DOCTYPE html>\n" +
					"<html>\n" +
					"<head>\n" +
					"    <style>\n" +
					"        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; }\n" +
					"        .container { max-width: 600px; background-color: #FFFFFF; border-radius: 16px; padding: 40px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }\n" +
					"        .logo { font-size: 28px; font-weight: 900; color: #4F46E5; text-align: center; margin-bottom: 24px; }\n" +
					"        h1 { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 16px; text-align: center; }\n" +
					"        p { font-size: 15px; color: #64748B; line-height: 24px; margin-bottom: 24px; }\n" +
					"        .otp-box { background-color: #EEF2FF; border: 2px dashed #6366F1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }\n" +
					"        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #4F46E5; margin: 0; }\n" +
					"        .footer { text-align: center; font-size: 13px; color: #94A3B8; margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 20px; }\n" +
					"    </style>\n" +
					"</head>\n" +
					"<body>\n" +
					"    <div class=\"container\">\n" +
					"        <div class=\"logo\">SpeakMateAI</div>\n" +
					"        <h1>Password Reset OTP</h1>\n" +
					"        <p>Hello %s,</p>\n" +
					"        <p>We received a request to reset your SpeakMateAI password. Use the Verification Code below to complete your reset request:</p>\n" +
					"        <div class=\"otp-box\">\n" +
					"            <h2 class=\"otp-code\">%s</h2>\n" +
					"        </div>\n" +
					"        <p>This OTP code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.</p>\n" +
					"        <p>If you did not request a password reset, please ignore this message.</p>\n" +
					"        <div class=\"footer\">\n" +
					"            Regards,<br/><strong>SpeakMateAI Team</strong>\n" +
					"        </div>\n" +
					"    </div>\n" +
					"</body>\n" +
					"</html>", user.getFirstName(), otp);

				helper.setText(htmlContent, true);
				mailSender.send(message);
				System.out.println("[Email Sent Successfully] OTP email sent to: " + user.getEmail());
			} else {
				System.out.println("[SMTP Offline] MailSender bean is not present. OTP for " + user.getEmail() + " is: " + otp);
			}
		} catch (Exception ex) {
			System.err.println("[SMTP Error] Failed to send OTP email: " + ex.getMessage());
			System.out.println("[Fallback Log] OTP for " + user.getEmail() + " is: " + otp);
		}
	}

	@Override
	public VerifyOtpResponse verifyOtp(VerifyOtpRequest request) {

		User user = userRepository.findByEmail(request.getEmail())
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or user not found."));

		if (user.getResetOtp() == null || !user.getResetOtp().equals(request.getOtp())) {
			throw new IllegalArgumentException("Invalid OTP code. Please check your email and try again.");
		}

		if (user.getResetOtpExpiry() == null || user.getResetOtpExpiry().isBefore(LocalDateTime.now())) {
			throw new IllegalArgumentException("OTP code has expired. Please request a new OTP.");
		}

		// Generate session token for reset password
		String token = UUID.randomUUID().toString();
		user.setResetPasswordToken(token);
		user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
		// Clear OTP once verified
		user.setResetOtp(null);
		user.setResetOtpExpiry(null);
		userRepository.save(user);

		return VerifyOtpResponse.builder()
				.token(token)
				.message("OTP verified successfully.")
				.build();
	}

	@Override
	public void resetPassword(ResetPasswordRequest request) {

		User user = userRepository.findByResetPasswordToken(request.getToken())
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token."));

		if (user.getResetPasswordTokenExpiry() == null || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
			throw new IllegalArgumentException("Reset token has expired.");
		}

		validatePasswordStrength(request.getNewPassword());

		user.setPassword(passwordEncoder.encode(request.getNewPassword()));
		user.setResetPasswordToken(null);
		user.setResetPasswordTokenExpiry(null);
		userRepository.save(user);
	}

	@Override
	public List<UserResponse> getAllUsers() {

		List<User> users = userRepository.findAll();

		return users.stream()
				.map(this::mapToUserResponse)
				.toList();
	}

	@Override
	public UserResponse getUserById(Long id) {

		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));

		return mapToUserResponse(user);
	}

	@Override
	public UserResponse updateUser(Long id, RegisterRequest request) {

		User user = userRepository.findById(id).orElseThrow(() -> new UserNotFoundException("User not found"));

		if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
			throw new DuplicateEmailException("Email already exists.");
		}

		user.setFirstName(request.getFirstName());
		user.setLastName(request.getLastName());
		user.setEmail(request.getEmail());

		if (request.getPassword() != null && !request.getPassword().isBlank()) {
			user.setPassword(passwordEncoder.encode(request.getPassword()));
		}

		User updatedUser = userRepository.save(user);

		return mapToUserResponse(updatedUser);
	}

	private UserResponse mapToUserResponse(User user) {

		return UserResponse.builder().id(user.getId()).firstName(user.getFirstName()).lastName(user.getLastName())
				.email(user.getEmail()).role(user.getRole()).avatar(user.getAvatar()).active(user.isActive())
				.createdAt(user.getCreatedAt()).welcomeCompleted(user.isWelcomeCompleted())
				.onboardingCompleted(user.isOnboardingCompleted())
				.authProvider(user.getAuthProvider()).nativeLanguage(user.getNativeLanguage())
				.englishLevel(user.getEnglishLevel()).learningGoal(user.getLearningGoal())
				.dailyGoalMinutes(user.getDailyGoalMinutes()).preferredVoice(user.getPreferredVoice())
				.preferredAccent(user.getPreferredAccent()).interests(user.getInterests()).build();
	}

	private void validatePasswordStrength(String password) {
		if (password == null || password.length() < 8) {
			throw new IllegalArgumentException("Password must be at least 8 characters");
		}
		boolean hasUpper = false;
		boolean hasLower = false;
		boolean hasDigit = false;
		boolean hasSpecial = false;
		String specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?~`";
		for (char c : password.toCharArray()) {
			if (Character.isUpperCase(c)) {
				hasUpper = true;
			} else if (Character.isLowerCase(c)) {
				hasLower = true;
			} else if (Character.isDigit(c)) {
				hasDigit = true;
			} else if (specialChars.indexOf(c) >= 0 || !Character.isLetterOrDigit(c)) {
				hasSpecial = true;
			}
		}
		if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
			throw new IllegalArgumentException("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character");
		}
	}

	@Override
	public void sendDeleteAccountOtp(com.rslsolution.speakmateai.dto.request.SendDeleteAccountOtpRequest request) {
		String email = request.getEmail().toLowerCase().trim();
		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("No account found registered with email: " + email));

		String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
		deleteAccountOtpMap.put(email, new RegistrationOtpDetails(otp, LocalDateTime.now().plusMinutes(10)));

		System.out.println("[Delete Account OTP Generated] OTP for " + email + " is: " + otp);

		try {
			if (mailSender != null) {
				MimeMessage message = mailSender.createMimeMessage();
				MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
				helper.setFrom("dnyaneshwaralgule2003@gmail.com", "SpeakMateAI");
				helper.setTo(email);
				helper.setSubject("Confirm Account Deletion - SpeakMateAI");

				String htmlContent = String.format(
					"<!DOCTYPE html>\n" +
					"<html>\n" +
					"<head>\n" +
					"    <style>\n" +
					"        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 20px; }\n" +
					"        .container { max-width: 600px; background-color: #FFFFFF; border-radius: 16px; padding: 40px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }\n" +
					"        .logo { font-size: 28px; font-weight: 900; color: #EF4444; text-align: center; margin-bottom: 24px; }\n" +
					"        h1 { font-size: 22px; font-weight: 700; color: #0F172A; margin-bottom: 16px; text-align: center; }\n" +
					"        p { font-size: 15px; color: #64748B; line-height: 24px; margin-bottom: 24px; }\n" +
					"        .otp-box { background-color: #FEF2F2; border: 2px dashed #EF4444; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }\n" +
					"        .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #DC2626; margin: 0; }\n" +
					"        .footer { text-align: center; font-size: 13px; color: #94A3B8; margin-top: 32px; border-top: 1px solid #E2E8F0; padding-top: 20px; }\n" +
					"    </style>\n" +
					"</head>\n" +
					"<body>\n" +
					"    <div class=\"container\">\n" +
					"        <div class=\"logo\">SpeakMateAI</div>\n" +
					"        <h1>Account Deletion Verification Code</h1>\n" +
					"        <p>Hello %s,</p>\n" +
					"        <p>We received a request to permanently delete your SpeakMateAI account. Enter the verification code below to authorize account deletion. This code is valid for <strong>10 minutes</strong>.</p>\n" +
					"        <div class=\"otp-box\">\n" +
					"            <h2 class=\"otp-code\">%s</h2>\n" +
					"        </div>\n" +
					"        <p>If you did not request to delete your account, please ignore this email and your account will remain safe.</p>\n" +
					"        <div class=\"footer\">\n" +
					"            &copy; 2026 SpeakMateAI. All rights reserved.\n" +
					"        </div>\n" +
					"    </div>\n" +
					"</body>\n" +
					"</html>",
					user.getFirstName() != null ? user.getFirstName() : "User",
					otp
				);

				helper.setText(htmlContent, true);
				mailSender.send(message);
				System.out.println("[Email Sent] Delete Account OTP successfully sent to: " + email);
			}
		} catch (Exception e) {
			System.err.println("[Email Send Warning] Could not send delete account OTP email: " + e.getMessage());
		}
	}

	@Override
	public void deleteAccountWithOtp(com.rslsolution.speakmateai.dto.request.DeleteAccountRequest request) {
		String email = request.getEmail().toLowerCase().trim();
		String otp = request.getOtp() != null ? request.getOtp().trim() : "";

		RegistrationOtpDetails otpDetails = deleteAccountOtpMap.get(email);

		if (otpDetails == null) {
			throw new InvalidCredentialsException("No active OTP code found for this email. Please tap 'Send OTP' to receive a code.");
		}

		if (LocalDateTime.now().isAfter(otpDetails.getExpiry())) {
			deleteAccountOtpMap.remove(email);
			throw new InvalidCredentialsException("The OTP verification code has expired. Please tap 'Send OTP' to get a new code.");
		}

		if (!otpDetails.getOtp().trim().equals(otp)) {
			throw new InvalidCredentialsException("The 6-digit OTP code is incorrect. Please check your email or console log.");
		}

		deleteAccountOtpMap.remove(email);

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UserNotFoundException("No account found with email: " + email));

		deleteUser(user.getId());
	}

	@Override
	public void deleteUser(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new UserNotFoundException("User not found with id: " + id));

		String[] deleteQueries = new String[] {
			"DELETE FROM vocabulary WHERE user_id = :userId",
			"DELETE FROM chat_bookmarks WHERE user_id = :userId",
			"DELETE FROM chat_messages WHERE session_id IN (SELECT id FROM chat_sessions WHERE user_id = :userId)",
			"DELETE FROM chat_sessions WHERE user_id = :userId",
			"DELETE FROM conversation_feedback WHERE session_id IN (SELECT id FROM conversation_messages WHERE user_id = :userId)",
			"DELETE FROM conversation_messages WHERE user_id = :userId",
			"DELETE FROM speaking_sessions WHERE user_id = :userId",
			"DELETE FROM grammar_history WHERE user_id = :userId",
			"DELETE FROM lesson_progress WHERE user_id = :userId",
			"DELETE FROM notifications WHERE user_id = :userId",
			"DELETE FROM achievements WHERE user_id = :userId",
			"DELETE FROM progress WHERE user_id = :userId",
			"DELETE FROM settings WHERE user_id = :userId",
			"DELETE FROM onboarding WHERE user_id = :userId",
			"DELETE FROM users WHERE id = :userId"
		};

		for (String sql : deleteQueries) {
			try {
				entityManager.createNativeQuery(sql).setParameter("userId", id).executeUpdate();
			} catch (Exception e) {
				System.err.println("[Delete User SQL Warning] " + sql + " -> " + e.getMessage());
			}
		}

		System.out.println("[User Deleted] Permanently removed user ID: " + id + " and all associated records.");
	}

}
