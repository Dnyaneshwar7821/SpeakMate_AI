package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileRequest {

	@NotBlank(message = "First name is required")
	private String firstName;

	@NotBlank(message = "Last name is required")
	private String lastName;

	@NotBlank(message = "Email is required")
	@Email(message = "Invalid email format")
	private String email;

	private String englishLevel;

	private String learningGoal;

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

	public static ProfileRequestBuilder builder() {
		return new ProfileRequestBuilder();
	}

	public static class ProfileRequestBuilder {
		private String firstName;
		private String lastName;
		private String email;
		private String englishLevel;
		private String learningGoal;

		public ProfileRequestBuilder firstName(String firstName) { this.firstName = firstName; return this; }
		public ProfileRequestBuilder lastName(String lastName) { this.lastName = lastName; return this; }
		public ProfileRequestBuilder email(String email) { this.email = email; return this; }
		public ProfileRequestBuilder englishLevel(String englishLevel) { this.englishLevel = englishLevel; return this; }
		public ProfileRequestBuilder learningGoal(String learningGoal) { this.learningGoal = learningGoal; return this; }

		public ProfileRequest build() {
			return new ProfileRequest(firstName, lastName, email, englishLevel, learningGoal);
		}
	}
}