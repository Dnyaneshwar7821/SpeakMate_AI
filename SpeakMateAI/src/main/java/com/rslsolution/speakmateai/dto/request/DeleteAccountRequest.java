package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteAccountRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "OTP code is required")
	private String otp;

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getOtp() { return otp; }
	public void setOtp(String otp) { this.otp = otp; }

	public static DeleteAccountRequestBuilder builder() {
		return new DeleteAccountRequestBuilder();
	}

	public static class DeleteAccountRequestBuilder {
		private String email;
		private String otp;

		public DeleteAccountRequestBuilder email(String email) { this.email = email; return this; }
		public DeleteAccountRequestBuilder otp(String otp) { this.otp = otp; return this; }

		public DeleteAccountRequest build() {
			return new DeleteAccountRequest(email, otp);
		}
	}
}
