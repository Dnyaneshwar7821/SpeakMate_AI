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
public class SendDeleteAccountOtpRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public static SendDeleteAccountOtpRequestBuilder builder() {
		return new SendDeleteAccountOtpRequestBuilder();
	}

	public static class SendDeleteAccountOtpRequestBuilder {
		private String email;

		public SendDeleteAccountOtpRequestBuilder email(String email) { this.email = email; return this; }

		public SendDeleteAccountOtpRequest build() {
			return new SendDeleteAccountOtpRequest(email);
		}
	}
}
