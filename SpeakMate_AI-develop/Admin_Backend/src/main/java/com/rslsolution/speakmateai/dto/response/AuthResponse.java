package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

	private String token;
	private UserResponse user;

	public String getToken() { return token; }
	public void setToken(String token) { this.token = token; }

	public UserResponse getUser() { return user; }
	public void setUser(UserResponse user) { this.user = user; }

	public static AuthResponseBuilder builder() {
		return new AuthResponseBuilder();
	}

	public static class AuthResponseBuilder {
		private String token;
		private UserResponse user;

		public AuthResponseBuilder token(String token) { this.token = token; return this; }
		public AuthResponseBuilder user(UserResponse user) { this.user = user; return this; }

		public AuthResponse build() {
            AuthResponse obj = new AuthResponse();
            obj.setToken(token);
            obj.setUser(user);
            return obj;
        }
	}
}