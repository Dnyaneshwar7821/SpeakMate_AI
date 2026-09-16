package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolTeacherResponse {

	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	private String phone;
	private Long schoolId;
	private String schoolName;
	private Boolean active;
	private String role;
	private String department;
	private String experience;
	private String qualification;
	private java.util.List<com.rslsolution.speakmateai.dto.request.StandardDivisionPair> standardDivisions;
	private Boolean emailSent;

	public String getName() {
		String f = firstName != null ? firstName.trim() : "";
		String l = lastName != null ? lastName.trim() : "";
		String full = (f + " " + l).trim();
		return !full.isEmpty() ? full : (email != null ? email : "");
	}
}
