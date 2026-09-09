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
}
