package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyOtpResponse {

	private String token;
	private String message;

	public String getToken() { return token; }
	public void setToken(String token) { this.token = token; }

	public String getMessage() { return message; }
	public void setMessage(String message) { this.message = message; }

	public static VerifyOtpResponseBuilder builder() {
		return new VerifyOtpResponseBuilder();
	}

	public static class VerifyOtpResponseBuilder {
		private String token;
		private String message;

		public VerifyOtpResponseBuilder token(String token) { this.token = token; return this; }
		public VerifyOtpResponseBuilder message(String message) { this.message = message; return this; }

		public VerifyOtpResponse build() {
			return new VerifyOtpResponse(token, message);
		}
	}
}
