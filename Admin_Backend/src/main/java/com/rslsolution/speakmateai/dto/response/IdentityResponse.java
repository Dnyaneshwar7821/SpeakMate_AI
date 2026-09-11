package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IdentityResponse {
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String avatar;
	private String role;
	private Boolean active;
	private String standard;
	private String schoolName;
}
