package com.rslsolution.speakmateai.service;

import com.rslsolution.speakmateai.dto.request.AdminChangePasswordRequest;
import com.rslsolution.speakmateai.dto.request.AdminLoginRequest;
import com.rslsolution.speakmateai.dto.request.AdminRefreshTokenRequest;
import com.rslsolution.speakmateai.dto.request.ForgotPasswordRequest;
import com.rslsolution.speakmateai.dto.request.ResetPasswordRequest;
import com.rslsolution.speakmateai.dto.request.VerifyOtpRequest;
import com.rslsolution.speakmateai.dto.response.AdminLoginResponse;
import com.rslsolution.speakmateai.dto.response.VerifyOtpResponse;

public interface AdminAuthService {

	/**
	 * Registers a new admin.
	 *
	 * @param request the registration request details
	 * @return the admin response
	 */
	void register(com.rslsolution.speakmateai.dto.request.AdminRegisterRequest request);

	/**
	 * Authenticates an admin and updates the last login timestamp.
	 *
	 * @param request the login request details
	 * @return the login response containing admin info and JWT token
	 */
	AdminLoginResponse login(AdminLoginRequest request);

	/**
	 * Logs out the current admin session.
	 */
	void logout();

	/**
	 * Changes the password of the currently authenticated admin.
	 *
	 * @param request the change password request details
	 */
	void changePassword(AdminChangePasswordRequest request);

	/**
	 * Stub for forgot password logic.
	 *
	 * @param request the forgot password request details
	 */
	void forgotPassword(ForgotPasswordRequest request);

	/**
	 * Verifies the OTP sent to admin email.
	 */
	VerifyOtpResponse verifyOtp(VerifyOtpRequest request);

	/**
	 * Resets the admin password using a valid token.
	 */
	void resetPassword(ResetPasswordRequest request);

	/**
	 * Stub for refreshing admin JWT tokens.
	 *
	 * @param request the refresh token request details
	 * @return the new login response containing fresh JWT token
	 */
	AdminLoginResponse refreshToken(AdminRefreshTokenRequest request);
}
