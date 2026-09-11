package com.rslsolution.speakmateai.dto.response;

import java.util.List;
import com.rslsolution.speakmateai.dto.request.StandardDivisionPair;
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
	private List<StandardDivisionPair> standardDivisions;
	private Boolean emailSent;

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }

	public String getFirstName() { return firstName; }
	public void setFirstName(String firstName) { this.firstName = firstName; }

	public String getLastName() { return lastName; }
	public void setLastName(String lastName) { this.lastName = lastName; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getPhone() { return phone; }
	public void setPhone(String phone) { this.phone = phone; }

	public Long getSchoolId() { return schoolId; }
	public void setSchoolId(Long schoolId) { this.schoolId = schoolId; }

	public String getSchoolName() { return schoolName; }
	public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

	public Boolean getActive() { return active; }
	public void setActive(Boolean active) { this.active = active; }

	public String getRole() { return role; }
	public void setRole(String role) { this.role = role; }

	public String getDepartment() { return department; }
	public void setDepartment(String department) { this.department = department; }

	public String getExperience() { return experience; }
	public void setExperience(String experience) { this.experience = experience; }

	public String getQualification() { return qualification; }
	public void setQualification(String qualification) { this.qualification = qualification; }

	public List<StandardDivisionPair> getStandardDivisions() { return standardDivisions; }
	public void setStandardDivisions(List<StandardDivisionPair> standardDivisions) { this.standardDivisions = standardDivisions; }

	public Boolean getEmailSent() { return emailSent; }
	public void setEmailSent(Boolean emailSent) { this.emailSent = emailSent; }

	public static SchoolTeacherResponseBuilder builder() {
		return new SchoolTeacherResponseBuilder();
	}

	public static class SchoolTeacherResponseBuilder {
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
		private List<StandardDivisionPair> standardDivisions;
		private Boolean emailSent;

		public SchoolTeacherResponseBuilder id(Long id) { this.id = id; return this; }
		public SchoolTeacherResponseBuilder firstName(String firstName) { this.firstName = firstName; return this; }
		public SchoolTeacherResponseBuilder lastName(String lastName) { this.lastName = lastName; return this; }
		public SchoolTeacherResponseBuilder email(String email) { this.email = email; return this; }
		public SchoolTeacherResponseBuilder phone(String phone) { this.phone = phone; return this; }
		public SchoolTeacherResponseBuilder schoolId(Long schoolId) { this.schoolId = schoolId; return this; }
		public SchoolTeacherResponseBuilder schoolName(String schoolName) { this.schoolName = schoolName; return this; }
		public SchoolTeacherResponseBuilder active(Boolean active) { this.active = active; return this; }
		public SchoolTeacherResponseBuilder role(String role) { this.role = role; return this; }
		public SchoolTeacherResponseBuilder department(String department) { this.department = department; return this; }
		public SchoolTeacherResponseBuilder experience(String experience) { this.experience = experience; return this; }
		public SchoolTeacherResponseBuilder qualification(String qualification) { this.qualification = qualification; return this; }
		public SchoolTeacherResponseBuilder standardDivisions(List<StandardDivisionPair> standardDivisions) { this.standardDivisions = standardDivisions; return this; }
		public SchoolTeacherResponseBuilder emailSent(Boolean emailSent) { this.emailSent = emailSent; return this; }

		public SchoolTeacherResponse build() {
			SchoolTeacherResponse r = new SchoolTeacherResponse();
			r.id = id;
			r.firstName = firstName;
			r.lastName = lastName;
			r.email = email;
			r.phone = phone;
			r.schoolId = schoolId;
			r.schoolName = schoolName;
			r.active = active;
			r.role = role;
			r.department = department;
			r.experience = experience;
			r.qualification = qualification;
			r.standardDivisions = standardDivisions;
			r.emailSent = emailSent;
			return r;
		}
	}
}
