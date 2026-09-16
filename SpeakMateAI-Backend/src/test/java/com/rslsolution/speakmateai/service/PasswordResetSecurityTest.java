package com.rslsolution.speakmateai.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.rslsolution.speakmateai.dto.request.LoginRequest;
import com.rslsolution.speakmateai.dto.request.ResetPasswordRequest;
import com.rslsolution.speakmateai.dto.response.AuthResponse;
import com.rslsolution.speakmateai.entity.User;
import com.rslsolution.speakmateai.enums.Role;
import com.rslsolution.speakmateai.exception.InvalidCredentialsException;
import com.rslsolution.speakmateai.repository.OnboardingRepository;
import com.rslsolution.speakmateai.repository.UserRepository;
import com.rslsolution.speakmateai.service.impl.UserServiceImpl;
import com.rslsolution.speakmateai.util.JwtUtil;

@ExtendWith(MockitoExtension.class)
public class PasswordResetSecurityTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private OnboardingRepository onboardingRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtUtil jwtUtil;

	@InjectMocks
	private UserServiceImpl userService;

	private User testUser;
	private final String validToken = "valid-reset-token-uuid-1234";
	private final String encodedOldPassword = "$2a$10$oldEncodedHashValueExample12345678901234567890123456";
	private final String rawOldPassword = "OldPassword1!";
	private final String rawNewPassword = "NewSecurePassword2@";
	private final String encodedNewPassword = "$2a$10$newEncodedHashValueExample12345678901234567890123456";

	@BeforeEach
	void setUp() {
		testUser = User.builder()
				.id(1L)
				.email("user@example.com")
				.firstName("John")
				.lastName("Doe")
				.password(encodedOldPassword)
				.role(Role.USER)
				.active(true)
				.resetPasswordToken(validToken)
				.resetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15))
				.build();
	}

	// =========================================================================
	// 1. Existing Password Reuse Prevention
	// =========================================================================

	@Test
	@DisplayName("Should reject password reset when new password is the same as current password")
	void testRejectOldPasswordReuse() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));
		when(passwordEncoder.matches(rawOldPassword, encodedOldPassword)).thenReturn(true);

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, rawOldPassword, rawOldPassword);

		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});

		assertEquals("New password cannot be the same as your old password.", ex.getMessage());
		verify(userRepository, never()).save(any(User.class));
		verify(passwordEncoder, never()).encode(rawOldPassword);
	}

	@Test
	@DisplayName("Should allow new password if casing is different from current password")
	void testAllowPasswordWithDifferentCasing() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));
		String validVariant = "Oldpassword1@"; 
		when(passwordEncoder.matches(validVariant, encodedOldPassword)).thenReturn(false);
		when(passwordEncoder.encode(validVariant)).thenReturn("$2a$10$variantHash1234567890");

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, validVariant, validVariant);
		userService.resetPassword(request);

		ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(userCaptor.capture());
		User saved = userCaptor.getValue();
		assertEquals("$2a$10$variantHash1234567890", saved.getPassword());
		assertNull(saved.getResetPasswordToken());
		assertNull(saved.getResetPasswordTokenExpiry());
	}

	@Test
	@DisplayName("Should preserve accidental whitespace and not silently trim credentials")
	void testPasswordNotSilentlyTrimmed() {
		String passwordWithSpaces = " NewPassword1! ";
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));
		when(passwordEncoder.matches(passwordWithSpaces, encodedOldPassword)).thenReturn(false);
		when(passwordEncoder.encode(passwordWithSpaces)).thenReturn("$2a$10$hashedWithSpaces123");

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, passwordWithSpaces, passwordWithSpaces);
		userService.resetPassword(request);

		// Verify that the password encoder received the raw untrimmed string
		verify(passwordEncoder).encode(passwordWithSpaces);
		verify(passwordEncoder).matches(passwordWithSpaces, encodedOldPassword);
	}

	// =========================================================================
	// 2. Valid Password Reset & Login Verification
	// =========================================================================

	@Test
	@DisplayName("Should successfully reset password with valid new credentials and invalidate token")
	void testSuccessfulPasswordReset() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));
		when(passwordEncoder.matches(rawNewPassword, encodedOldPassword)).thenReturn(false);
		when(passwordEncoder.encode(rawNewPassword)).thenReturn(encodedNewPassword);

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, rawNewPassword, rawNewPassword);
		userService.resetPassword(request);

		ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(captor.capture());
		User saved = captor.getValue();

		assertEquals(encodedNewPassword, saved.getPassword());
		assertNull(saved.getResetPasswordToken());
		assertNull(saved.getResetPasswordTokenExpiry());
	}

	@Test
	@DisplayName("Login with new password succeeds and login with old password fails after reset")
	void testLoginWithNewAndOldPasswordAfterReset() {
		// Simulate state after reset
		testUser.setPassword(encodedNewPassword);
		testUser.setResetPasswordToken(null);
		testUser.setResetPasswordTokenExpiry(null);

		when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(testUser));
		when(onboardingRepository.findByUser(testUser)).thenReturn(Optional.empty());

		// 1. Login with NEW password -> SUCCESS
		when(passwordEncoder.matches(rawNewPassword, encodedNewPassword)).thenReturn(true);
		when(jwtUtil.generateToken("user@example.com")).thenReturn("mock-jwt-token");

		AuthResponse authResponse = userService.login(new LoginRequest("user@example.com", rawNewPassword));
		assertNotNull(authResponse);
		assertEquals("mock-jwt-token", authResponse.getToken());

		// 2. Login with OLD password -> FAILS
		when(passwordEncoder.matches(rawOldPassword, encodedNewPassword)).thenReturn(false);

		assertThrows(InvalidCredentialsException.class, () -> {
			userService.login(new LoginRequest("user@example.com", rawOldPassword));
		});
	}

	// =========================================================================
	// 3. Password Format & Strength Validation Matrix
	// =========================================================================

	@Test
	@DisplayName("Should reject null password")
	void testRejectNullPassword() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, null, null);
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password cannot be empty or whitespace only", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject empty password")
	void testRejectEmptyPassword() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "", "");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password cannot be empty or whitespace only", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject whitespace-only password")
	void testRejectWhitespaceOnlyPassword() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "        ", "        ");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password cannot be empty or whitespace only", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password shorter than 8 characters")
	void testRejectShortPassword() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "Sh1!ort", "Sh1!ort");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password must be at least 8 characters", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password exceeding maximum supported length (128 characters)")
	void testRejectPasswordExceedingMaxLength() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		String excessivelyLong = "A1!" + "a".repeat(126);
		assertEquals(129, excessivelyLong.length());

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, excessivelyLong, excessivelyLong);
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password must not exceed 128 characters", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password missing uppercase letter")
	void testRejectMissingUppercase() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "password123!", "password123!");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password missing lowercase letter")
	void testRejectMissingLowercase() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "PASSWORD123!", "PASSWORD123!");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password missing number")
	void testRejectMissingNumber() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "PasswordSpecial!", "PasswordSpecial!");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password missing special character")
	void testRejectMissingSpecialChar() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, "Password12345", "Password12345");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", ex.getMessage());
	}

	// =========================================================================
	// 4. Confirm Password Validation
	// =========================================================================

	@Test
	@DisplayName("Should reject password reset when confirm password does not match new password")
	void testRejectConfirmPasswordMismatch() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, rawNewPassword, "DifferentPassword9#");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Passwords do not match.", ex.getMessage());
		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	@DisplayName("Should succeed when confirm password matches new password")
	void testAcceptMatchingConfirmPassword() {
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));
		when(passwordEncoder.matches(rawNewPassword, encodedOldPassword)).thenReturn(false);
		when(passwordEncoder.encode(rawNewPassword)).thenReturn(encodedNewPassword);

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, rawNewPassword, rawNewPassword);
		userService.resetPassword(request);

		verify(userRepository).save(any(User.class));
	}

	// =========================================================================
	// 5. Reset Authorization & Token Security
	// =========================================================================

	@Test
	@DisplayName("Should reject password reset with null or empty token")
	void testRejectNullOrEmptyToken() {
		ResetPasswordRequest request = new ResetPasswordRequest("", rawNewPassword, rawNewPassword);
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Invalid or expired reset token.", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password reset with invalid token")
	void testRejectInvalidToken() {
		when(userRepository.findByResetPasswordToken("non-existent-token")).thenReturn(Optional.empty());

		ResetPasswordRequest request = new ResetPasswordRequest("non-existent-token", rawNewPassword, rawNewPassword);
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Invalid or expired reset token.", ex.getMessage());
	}

	@Test
	@DisplayName("Should reject password reset with expired token")
	void testRejectExpiredToken() {
		testUser.setResetPasswordTokenExpiry(LocalDateTime.now().minusMinutes(1)); // expired
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.of(testUser));

		ResetPasswordRequest request = new ResetPasswordRequest(validToken, rawNewPassword, rawNewPassword);
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(request);
		});
		assertEquals("Reset token has expired.", ex.getMessage());
		verify(userRepository, never()).save(any(User.class));
	}

	@Test
	@DisplayName("Should prevent already-used reset token reuse (one-time use)")
	void testRejectAlreadyUsedToken() {
		// After first reset, token is null in database
		when(userRepository.findByResetPasswordToken(validToken)).thenReturn(Optional.empty());

		ResetPasswordRequest secondAttempt = new ResetPasswordRequest(validToken, "AnotherPass9#", "AnotherPass9#");
		IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
			userService.resetPassword(secondAttempt);
		});
		assertEquals("Invalid or expired reset token.", ex.getMessage());
	}
}
