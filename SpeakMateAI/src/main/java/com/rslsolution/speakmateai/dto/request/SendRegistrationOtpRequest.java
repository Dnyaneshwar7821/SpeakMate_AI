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
public class SendRegistrationOtpRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public static SendRegistrationOtpRequestBuilder builder() {
		return new SendRegistrationOtpRequestBuilder();
	}

	public static class SendRegistrationOtpRequestBuilder {
		private String email;

		public SendRegistrationOtpRequestBuilder email(String email) { this.email = email; return this; }

		public SendRegistrationOtpRequest build() {
			return new SendRegistrationOtpRequest(email);
		}
	}
}
