package com.rslsolution.speakmateai.service;

import java.util.List;

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

public interface UserService {

	void sendRegistrationOtp(SendRegistrationOtpRequest request);

	void sendDeleteAccountOtp(SendDeleteAccountOtpRequest request);

	void deleteAccountWithOtp(DeleteAccountRequest request);

	UserResponse register(RegisterRequest request);

	AuthResponse login(LoginRequest request);

	UserResponse getCurrentUser();

	void forgotPassword(ForgotPasswordRequest request);

	VerifyOtpResponse verifyOtp(VerifyOtpRequest request);

	void resetPassword(ResetPasswordRequest request);

	List<UserResponse> getAllUsers();

	UserResponse getUserById(Long id);

	UserResponse updateUser(Long id, RegisterRequest request);

	void deleteUser(Long id);

}
