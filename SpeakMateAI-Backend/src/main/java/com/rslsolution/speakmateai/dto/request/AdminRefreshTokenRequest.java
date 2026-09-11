package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRefreshTokenRequest {

	@NotBlank(message = "Refresh token is required")
	private String refreshToken;

	public String getRefreshToken() { return refreshToken; }
	public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }

	public static AdminRefreshTokenRequestBuilder builder() {
		return new AdminRefreshTokenRequestBuilder();
	}

	public static class AdminRefreshTokenRequestBuilder {
		private String refreshToken;

		public AdminRefreshTokenRequestBuilder refreshToken(String refreshToken) { this.refreshToken = refreshToken; return this; }

		public AdminRefreshTokenRequest build() {
			AdminRefreshTokenRequest r = new AdminRefreshTokenRequest();
			r.refreshToken = refreshToken;
			return r;
		}
	}
}
