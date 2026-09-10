package com.rslsolution.speakmateai.dto.request;

import java.util.List;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolTeacherRequest {

	@NotBlank(message = "Teacher first name is required")
	private String firstName;

	@NotBlank(message = "Teacher last name is required")
	private String lastName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	@Pattern(regexp = "^$|^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$", message = "Password must be at least 8 characters and contain at least one digit, one lowercase, one uppercase, and one special character")
	private String password;

	@Pattern(regexp = "^$|^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
	private String phone;

	@Builder.Default
	private boolean active = true;

	private List<StandardDivisionPair> standardDivisions;

	private String standard;

	private String division;

	private Long schoolId;

	private String department;

	private String experience;

	private String qualification;
}
