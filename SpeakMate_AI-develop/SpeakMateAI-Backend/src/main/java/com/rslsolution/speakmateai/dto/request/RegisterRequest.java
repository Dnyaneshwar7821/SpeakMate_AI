package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Password confirmation is required")
    private String confirmPassword;

    private String otp;

    private String accountType; // "STUDENT" or "INDIVIDUAL_USER"

    private String schoolCode;

    private String schoolGrade;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getSchoolCode() { return schoolCode; }
    public void setSchoolCode(String schoolCode) { this.schoolCode = schoolCode; }

    public String getSchoolGrade() { return schoolGrade; }
    public void setSchoolGrade(String schoolGrade) { this.schoolGrade = schoolGrade; }

    public static RegisterRequestBuilder builder() {
        return new RegisterRequestBuilder();
    }

    public static class RegisterRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String confirmPassword;
        private String otp;
        private String accountType;
        private String schoolCode;
        private String schoolGrade;

        public RegisterRequestBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public RegisterRequestBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public RegisterRequestBuilder email(String email) { this.email = email; return this; }
        public RegisterRequestBuilder password(String password) { this.password = password; return this; }
        public RegisterRequestBuilder confirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; return this; }
        public RegisterRequestBuilder otp(String otp) { this.otp = otp; return this; }
        public RegisterRequestBuilder accountType(String accountType) { this.accountType = accountType; return this; }
        public RegisterRequestBuilder schoolCode(String schoolCode) { this.schoolCode = schoolCode; return this; }
        public RegisterRequestBuilder schoolGrade(String schoolGrade) { this.schoolGrade = schoolGrade; return this; }

        public RegisterRequest build() {
            RegisterRequest obj = new RegisterRequest();
            obj.setFirstName(firstName);
            obj.setLastName(lastName);
            obj.setEmail(email);
            obj.setPassword(password);
            obj.setConfirmPassword(confirmPassword);
            obj.setOtp(otp);
            obj.setAccountType(accountType);
            obj.setSchoolCode(schoolCode);
            obj.setSchoolGrade(schoolGrade);
            return obj;
        }
    }
}