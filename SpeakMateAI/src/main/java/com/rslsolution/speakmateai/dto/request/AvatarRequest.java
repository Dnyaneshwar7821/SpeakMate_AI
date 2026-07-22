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
public class AvatarRequest {

	@NotBlank(message = "Avatar is required")
	private String avatar;

	public String getAvatar() { return avatar; }
	public void setAvatar(String avatar) { this.avatar = avatar; }

	public static AvatarRequestBuilder builder() {
		return new AvatarRequestBuilder();
	}

	public static class AvatarRequestBuilder {
		private String avatar;

		public AvatarRequestBuilder avatar(String avatar) { this.avatar = avatar; return this; }

		public AvatarRequest build() {
			return new AvatarRequest(avatar);
		}
	}
}