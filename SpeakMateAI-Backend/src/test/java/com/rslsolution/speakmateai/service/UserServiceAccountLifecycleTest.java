package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.request.RegisterRequest;
import com.rslsolution.speakmateai.dto.request.SendRegistrationOtpRequest;
import com.rslsolution.speakmateai.dto.request.VerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.dto.response.UserResponse;
import com.rslsolution.speakmateai.dto.response.VerifyOtpResponse;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.DuplicateEmailException;
import com.rslsolution.speakmateai.exception.InvalidCredentialsException;
import com.rslsolution.speakmateai.repository.OnboardingRepository;
import com.rslsolution.speakmateai.repository.ProgressRepository;
import com.rslsolution.speakmateai.repository.SettingsRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.repository.UserSubscriptionRepository;
import com.rslsolution.speakmateai.service.impl.UserServiceImpl;
import com.rslsolution.speakmateai.util.JwtUtil;

import jakarta.persistence.EntityManager;

@ExtendWith(MockitoExtension.class)
public class UserServiceAccountLifecycleTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private ProgressRepository progressRepository;

	@Mock
	private SettingsRepository settingsRepository;

	@Mock
	private OnboardingRepository onboardingRepository;

	@Mock
	private UserSubscriptionRepository userSubscriptionRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtUtil jwtUtil;

	@Mock
	private JdbcTemplate jdbcTemplate;

	@Mock
	private EntityManager entityManager;

	@Mock
	private com.rslsolution.speakmateai.repository.AdminRepository adminRepository;

	@InjectMocks
	private UserServiceImpl userService;

	private CustomUserDetailsService customUserDetailsService;

	private final String testEmail = "test@example.com";
	private final String oldPassword = "TestPassword123!";
	private final String oldPasswordHash = "$2a$10$oldPasswordHashedString";
	private final String newPassword = "NewPassword123!";
	private final String newPasswordHash = "$2a$10$newPasswordHashedString";

	private User activeUser;

	@BeforeEach
	void setUp() {
		customUserDetailsService = new CustomUserDetailsService(userRepository, adminRepository);

		activeUser = User.builder()
				.id(100L)
				.firstName("John")
				.lastName("Doe")
				.email(testEmail)
				.password(oldPasswordHash)
				.role(Role.USER)
				.active(true)
				.build();
	}

	@Test
	@DisplayName("Scenario A: Active user can log in and duplicate registration is rejected")
	void scenarioA_activeAccountLoginSuccessAndDuplicateRejected() {
		when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(activeUser));
		when(passwordEncoder.matches(oldPassword, oldPasswordHash)).thenReturn(true);
		when(jwtUtil.generateToken(testEmail)).thenReturn("mocked.jwt.token");

		// 1. Login succeeds
		LoginRequest loginRequest = new LoginRequest(testEmail, oldPassword);
		AuthResponse response = userService.login(loginRequest);

		assertNotNull(response);
		assertEquals("mocked.jwt.token", response.getToken());
		assertEquals(testEmail, response.getUser().getEmail());

		// 2. Duplicate registration attempt fails
		when(userRepository.existsByEmail(testEmail)).thenReturn(true);

		RegisterRequest regRequest = new RegisterRequest();
		regRequest.setEmail(testEmail);
		regRequest.setPassword("AnyPassword123!");
		regRequest.setConfirmPassword("AnyPassword123!");

		assertThrows(DuplicateEmailException.class, () -> userService.register(regRequest));

		// 3. Duplicate OTP request fails
		SendRegistrationOtpRequest otpRequest = new SendRegistrationOtpRequest(testEmail);
		assertThrows(DuplicateEmailException.class, () -> userService.sendRegistrationOtp(otpRequest));
	}

	@Test
	@DisplayName("Scenario B: Account deletion executes atomic hard delete on users table")
	void scenarioB_accountDeletionRemovesUserRow() {
		when(userRepository.existsById(100L)).thenReturn(true);
		when(jdbcTemplate.update(eq("DELETE FROM users WHERE id = ?"), eq(100L))).thenReturn(1);

		// Execute deletion
		userService.deleteUser(100L);

		// Verify that DELETE FROM users was invoked
		verify(jdbcTemplate).update(eq("DELETE FROM users WHERE id = ?"), eq(100L));
	}

	@Test
	@DisplayName("Scenario C: Login after deletion must fail and stale auth is rejected")
	void scenarioC_loginAfterDeletionMustFail() {
		// User does not exist in repository anymore
		when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.empty());
		when(userRepository.findByEmail(testEmail)).thenReturn(Optional.empty());

		// 1. Login attempt fails with InvalidCredentialsException
		LoginRequest loginRequest = new LoginRequest(testEmail, oldPassword);
		assertThrows(InvalidCredentialsException.class, () -> userService.login(loginRequest));

		// 2. Stale JWT token filter lookup fails with UsernameNotFoundException
		assertThrows(UsernameNotFoundException.class, () -> customUserDetailsService.loadUserByUsername(testEmail));
	}

	@Test
	@DisplayName("Scenario D: Registering the same email creates a fresh account and old password fails")
	void scenarioD_registerSameEmailAgainCreatesNewAccount() throws Exception {
		// Step 1: User does not exist in DB
		when(userRepository.existsByEmail(testEmail)).thenReturn(false);
		when(userRepository.existsByEmailIgnoreCase(testEmail)).thenReturn(false);

		// Inject valid OTP into registrationOtpMap
		Field otpMapField = UserServiceImpl.class.getDeclaredField("registrationOtpMap");
		otpMapField.setAccessible(true);
		@SuppressWarnings("unchecked")
		Map<String, Object> otpMap = (Map<String, Object>) otpMapField.get(userService);

		Class<?> otpDetailsClass = Class
				.forName("com.rslsolution.speakmateai.service.impl.UserServiceImpl$RegistrationOtpDetails");
		java.lang.reflect.Constructor<?> constructor = otpDetailsClass.getDeclaredConstructor(String.class,
				LocalDateTime.class);
		constructor.setAccessible(true);
		Object otpDetailsObj = constructor.newInstance("123456", LocalDateTime.now().plusMinutes(10));
		otpMap.put(testEmail, otpDetailsObj);

		// Step 2: Set up saving the new user
		User newUser = User.builder()
				.id(200L)
				.firstName("Jane")
				.lastName("Doe")
				.email(testEmail)
				.password(newPasswordHash)
				.role(Role.USER)
				.active(true)
				.build();

		when(passwordEncoder.encode(newPassword)).thenReturn(newPasswordHash);
		when(userRepository.save(any(User.class))).thenReturn(newUser);
		when(progressRepository.findByUser(any(User.class))).thenReturn(Optional.empty());
		when(settingsRepository.findByUser(any(User.class))).thenReturn(Optional.empty());
		when(onboardingRepository.findByUser(any(User.class))).thenReturn(Optional.empty());

		RegisterRequest regRequest = new RegisterRequest();
		regRequest.setFirstName("Jane");
		regRequest.setLastName("Doe");
		regRequest.setEmail(testEmail);
		regRequest.setPassword(newPassword);
		regRequest.setConfirmPassword(newPassword);
		regRequest.setOtp("123456");

		UserResponse regResponse = userService.register(regRequest);
		assertNotNull(regResponse);
		assertEquals(200L, regResponse.getId());
		assertEquals(testEmail, regResponse.getEmail());

		// Step 3: Verify login behavior on the new account
		when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(newUser));
		when(passwordEncoder.matches(newPassword, newPasswordHash)).thenReturn(true);
		when(passwordEncoder.matches(oldPassword, newPasswordHash)).thenReturn(false);
		when(jwtUtil.generateToken(testEmail)).thenReturn("new.jwt.token");

		// New password succeeds
		AuthResponse newAuth = userService.login(new LoginRequest(testEmail, newPassword));
		assertEquals("new.jwt.token", newAuth.getToken());

		// Old password fails
		assertThrows(InvalidCredentialsException.class,
				() -> userService.login(new LoginRequest(testEmail, oldPassword)));
	}

	@Test
	@DisplayName("Scenario E: Duplicate protection blocks registering test@example.com when active")
	void scenarioE_duplicateProtectionBlocksActiveUser() {
		when(userRepository.existsByEmail(testEmail)).thenReturn(true);

		RegisterRequest regRequest = new RegisterRequest();
		regRequest.setEmail(testEmail);
		regRequest.setPassword(newPassword);
		regRequest.setConfirmPassword(newPassword);

		assertThrows(DuplicateEmailException.class, () -> userService.register(regRequest));
	}

	@Test
	@DisplayName("Scenario F: Delete account OTP verification and deletion lifecycle")
	void scenarioF_deleteAccountOtpVerificationLifecycle() throws Exception {
		when(userRepository.findByEmailIgnoreCase(testEmail)).thenReturn(Optional.of(activeUser));

		// 1. Inject an active deletion OTP into deleteAccountOtpMap
		Field deleteMapField = UserServiceImpl.class.getDeclaredField("deleteAccountOtpMap");
		deleteMapField.setAccessible(true);
		@SuppressWarnings("unchecked")
		Map<String, Object> deleteMap = (Map<String, Object>) deleteMapField.get(null);

		Class<?> detailsClass = Class
				.forName("com.rslsolution.speakmateai.service.impl.UserServiceImpl$RegistrationOtpDetails");
		var constructor = detailsClass.getDeclaredConstructor(String.class, LocalDateTime.class);
		constructor.setAccessible(true);

		// Store active OTP "654321" valid for 10 minutes
		deleteMap.put(testEmail, constructor.newInstance("654321", LocalDateTime.now().plusMinutes(10)));

		// 2. Verification with wrong OTP throws IllegalArgumentException
		VerifyOtpRequest wrongOtpReq = new VerifyOtpRequest(testEmail, "000000");
		IllegalArgumentException wrongEx = assertThrows(IllegalArgumentException.class,
				() -> userService.verifyDeleteAccountOtp(wrongOtpReq));
		assertEquals("The 6-digit OTP code is incorrect. Please check your email.", wrongEx.getMessage());

		// 3. Verification with valid OTP succeeds
		VerifyOtpRequest validOtpReq = new VerifyOtpRequest(testEmail, "654321");
		VerifyOtpResponse verifyResp = userService.verifyDeleteAccountOtp(validOtpReq);
		assertNotNull(verifyResp);
		assertEquals("Code verified successfully.", verifyResp.getMessage());

		// 4. Verification with expired OTP throws IllegalArgumentException
		deleteMap.put(testEmail, constructor.newInstance("654321", LocalDateTime.now().minusMinutes(1)));
		IllegalArgumentException expiredEx = assertThrows(IllegalArgumentException.class,
				() -> userService.verifyDeleteAccountOtp(validOtpReq));
		assertEquals("The OTP verification code has expired. Please tap 'Resend Code' to get a new code.",
				expiredEx.getMessage());

		// 5. Verification when no OTP exists throws IllegalArgumentException
		deleteMap.remove(testEmail);
		IllegalArgumentException noneEx = assertThrows(IllegalArgumentException.class,
				() -> userService.verifyDeleteAccountOtp(validOtpReq));
		assertEquals("No active OTP code found for this email. Please tap 'Send Code' to receive a code.",
				noneEx.getMessage());
	}
}
