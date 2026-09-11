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
public class AdminLoginRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "Password is required")
	private String password;

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public static AdminLoginRequestBuilder builder() {
		return new AdminLoginRequestBuilder();
	}

	public static class AdminLoginRequestBuilder {
		private String email;
		private String password;

		public AdminLoginRequestBuilder email(String email) { this.email = email; return this; }
		public AdminLoginRequestBuilder password(String password) { this.password = password; return this; }

		public AdminLoginRequest build() {
			AdminLoginRequest r = new AdminLoginRequest();
			r.email = email;
			r.password = password;
			return r;
		}
	}
}
