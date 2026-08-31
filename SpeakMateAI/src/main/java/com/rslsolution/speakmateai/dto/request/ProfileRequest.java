package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileRequest {

	private String firstName;

	private String lastName;

	@Email(message = "Invalid email format")
	private String email;

	private String englishLevel;

	private String learningGoal;

	private String ageGroup;

	private String schoolGrade;

	private String avatar;

	public String getFirstName() { return firstName; }
	public void setFirstName(String firstName) { this.firstName = firstName; }

	public String getLastName() { return lastName; }
	public void setLastName(String lastName) { this.lastName = lastName; }

	public String getEmail() { return email; }
	public void setEmail(String email) { this.email = email; }

	public String getEnglishLevel() { return englishLevel; }
	public void setEnglishLevel(String englishLevel) { this.englishLevel = englishLevel; }

	public String getLearningGoal() { return learningGoal; }
	public void setLearningGoal(String learningGoal) { this.learningGoal = learningGoal; }

	public String getAgeGroup() { return ageGroup; }
	public void setAgeGroup(String ageGroup) { this.ageGroup = ageGroup; }

	public String getSchoolGrade() { return schoolGrade; }
	public void setSchoolGrade(String schoolGrade) { this.schoolGrade = schoolGrade; }

	public String getAvatar() { return avatar; }
	public void setAvatar(String avatar) { this.avatar = avatar; }

	public static ProfileRequestBuilder builder() {
		return new ProfileRequestBuilder();
	}

	public static class ProfileRequestBuilder {
		private String firstName;
		private String lastName;
		private String email;
		private String englishLevel;
		private String learningGoal;
		private String ageGroup;
		private String schoolGrade;
		private String avatar;

		public ProfileRequestBuilder firstName(String firstName) { this.firstName = firstName; return this; }
		public ProfileRequestBuilder lastName(String lastName) { this.lastName = lastName; return this; }
		public ProfileRequestBuilder email(String email) { this.email = email; return this; }
		public ProfileRequestBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
		public ProfileRequestBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }
		public ProfileRequestBuilder ageGroup(String ageGroup) { this.ageGroup = ageGroup; return this; }
		public ProfileRequestBuilder schoolGrade(String schoolGrade) { this.schoolGrade = schoolGrade; return this; }
		public ProfileRequestBuilder avatar(String avatar) { this.avatar = avatar; return this; }

		public ProfileRequest build() {
            ProfileRequest obj = new ProfileRequest();
            obj.setFirstName(firstName);
            obj.setLastName(lastName);
            obj.setEmail(email);
            obj.setEnglishLevel(englishLevel);
            obj.setLearningGoal(learningGoal);
            obj.setAgeGroup(ageGroup);
            obj.setSchoolGrade(schoolGrade);
            obj.setAvatar(avatar);
            return obj;
        }
	}
}