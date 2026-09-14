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
public class LoginRequest {

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "Password is required")
	private String password;

	private String schoolCode;
	private String portalType;
	private String loginType;

	public LoginRequest(String email, String password) {
		this.email = email;
		this.password = password;
	}

	public LoginRequest(String email, String password, String schoolCode) {
		this.email = email;
		this.password = password;
		this.schoolCode = schoolCode;
	}

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPassword() { return password; }
	public void setPassword(String password) { this.password = password; }

	public String getSchoolCode() { return schoolCode; }
	public void setSchoolCode(String schoolCode) { this.schoolCode = schoolCode; }

	public String getPortalType() { return portalType; }
	public void setPortalType(String portalType) { this.portalType = portalType; }

	public String getLoginType() { return loginType; }
	public void setLoginType(String loginType) { this.loginType = loginType; }

	public static LoginRequestBuilder builder() {
		return new LoginRequestBuilder();
	}

	public static class LoginRequestBuilder {
		private String email;
		private String password;
		private String schoolCode;
		private String portalType;
		private String loginType;

		public LoginRequestBuilder email(String email) { this.email = email; return this; }
		public LoginRequestBuilder password(String password) { this.password = password; return this; }
		public LoginRequestBuilder schoolCode(String schoolCode) { this.schoolCode = schoolCode; return this; }
		public LoginRequestBuilder portalType(String portalType) { this.portalType = portalType; return this; }
		public LoginRequestBuilder loginType(String loginType) { this.loginType = loginType; return this; }

		public LoginRequest build() {
            LoginRequest obj = new LoginRequest();
            obj.setEmail(email);
            obj.setPassword(password);
            obj.setSchoolCode(schoolCode);
            obj.setPortalType(portalType);
            obj.setLoginType(loginType);
            return obj;
        }
	}
}