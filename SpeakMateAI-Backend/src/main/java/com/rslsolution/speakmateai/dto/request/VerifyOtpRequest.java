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
public class VerifyOtpRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "OTP is required")
	private String otp;

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getOtp() { return otp; }
	public void setOtp(String otp) { this.otp = otp; }

	public static VerifyOtpRequestBuilder builder() {
		return new VerifyOtpRequestBuilder();
	}

	public static class VerifyOtpRequestBuilder {
		private String email;
		private String otp;

		public VerifyOtpRequestBuilder email(String email) { this.email = email; return this; }
		public VerifyOtpRequestBuilder otp(String otp) { this.otp = otp; return this; }

		public VerifyOtpRequest build() {
            VerifyOtpRequest obj = new VerifyOtpRequest();
            obj.setEmail(email);
            obj.setOtp(otp);
            return obj;
        }
	}
}
