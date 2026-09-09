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
public class AdminChangePasswordRequest {

	@NotBlank(message = "Old password is required")
	private String oldPassword;

	@NotBlank(message = "New password is required")
	private String newPassword;

	public String getOldPassword() { return oldPassword; }
	public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }

	public String getNewPassword() { return newPassword; }
	public void setNewPassword(String newPassword) { this.newPassword = newPassword; }

	public static AdminChangePasswordRequestBuilder builder() {
		return new AdminChangePasswordRequestBuilder();
	}

	public static class AdminChangePasswordRequestBuilder {
		private String oldPassword;
		private String newPassword;

		public AdminChangePasswordRequestBuilder oldPassword(String oldPassword) { this.oldPassword = oldPassword; return this; }
		public AdminChangePasswordRequestBuilder newPassword(String newPassword) { this.newPassword = newPassword; return this; }

		public AdminChangePasswordRequest build() {
			AdminChangePasswordRequest r = new AdminChangePasswordRequest();
			r.oldPassword = oldPassword;
			r.newPassword = newPassword;
			return r;
		}
	}
}
