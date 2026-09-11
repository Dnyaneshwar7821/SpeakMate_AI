package com.rslsolution.speakmateai.dto.response;

import com.rslsolution.speakmateai.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLoginResponse {

	private Long adminId;
	private String fullName;
	private String email;
	private Role role;
	private String profileImage;
	private String jwtToken;

	public Long getAdminId() { return adminId; }
	public void setAdminId(Long adminId) { this.adminId = adminId; }

	public String getFullName() { return fullName; }
	public void setFullName(String fullName) { this.fullName = fullName; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public Role getRole() { return role; }
	public void setRole(Role role) { this.role = role; }

	public String getProfileImage() { return profileImage; }
	public void setProfileImage(String profileImage) { this.profileImage = profileImage; }

	public String getJwtToken() { return jwtToken; }
	public void setJwtToken(String jwtToken) { this.jwtToken = jwtToken; }

	public static AdminLoginResponseBuilder builder() {
		return new AdminLoginResponseBuilder();
	}

	public static class AdminLoginResponseBuilder {
		private Long adminId;
		private String fullName;
		private String email;
		private Role role;
		private String profileImage;
		private String jwtToken;

		public AdminLoginResponseBuilder adminId(Long adminId) { this.adminId = adminId; return this; }
		public AdminLoginResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
		public AdminLoginResponseBuilder email(String email) { this.email = email; return this; }
		public AdminLoginResponseBuilder role(Role role) { this.role = role; return this; }
		public AdminLoginResponseBuilder profileImage(String profileImage) { this.profileImage = profileImage; return this; }
		public AdminLoginResponseBuilder jwtToken(String jwtToken) { this.jwtToken = jwtToken; return this; }

		public AdminLoginResponse build() {
			AdminLoginResponse r = new AdminLoginResponse();
			r.adminId = adminId;
			r.fullName = fullName;
			r.email = email;
			r.role = role;
			r.profileImage = profileImage;
			r.jwtToken = jwtToken;
			return r;
		}
	}
}
