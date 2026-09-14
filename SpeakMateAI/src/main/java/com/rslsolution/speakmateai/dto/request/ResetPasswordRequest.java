package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResetPasswordRequest {

	@NotBlank(message = "Token is required")
	private String token;

	@NotBlank(message = "New password is required")
	@Size(min = 8, message = "Password must be at least 8 characters")
	@Size(max = 128, message = "Password must not exceed 128 characters")
	private String newPassword;

	private String confirmPassword;

	public ResetPasswordRequest(String token, String newPassword) {
		this.token = token;
		this.newPassword = newPassword;
	}

	public String getToken() { return token; }
	public void setToken(String token) { this.token = token; }

	public String getNewPassword() { return newPassword; }
	public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

	public String getConfirmPassword() { return confirmPassword; }
	public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}
