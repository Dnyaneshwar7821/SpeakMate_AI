package com.rslsolution.speakmateai.dto.request;

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
public class AdminSchoolUserCreateRequest {
    
    @NotBlank(message = "Student First name is required")
    private String firstName;
    
    @NotBlank(message = "Student Last name is required")
    private String lastName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).*$", message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character")
    private String password;
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String phone;
    
    @NotBlank(message = "School name is required")
    private String schoolName;
    
    @NotBlank(message = "Standard is required")
    @Pattern(regexp = "^[0-9]+$", message = "Standard must be numeric")
    private String standard;
    
    @NotBlank(message = "Division is required")
    private String division;
    
    @NotBlank(message = "Roll number is required")
    @Pattern(regexp = "^[0-9]+$", message = "Roll number must be numeric")
    private String rollNumber;
    
    @NotBlank(message = "Parent name is required")
    private String parentName;
    
    @NotBlank(message = "Parent phone is required")
    @Pattern(regexp = "^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String parentPhone;
    
    private Long teacherId;
    
    @Builder.Default
    private boolean active = true;

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSchoolName() { return schoolName; }
    public void setSchoolName(String schoolName) { this.schoolName = schoolName; }

    public String getStandard() { return standard; }
    public void setStandard(String standard) { this.standard = standard; }

    public String getDivision() { return division; }
    public void setDivision(String division) { this.division = division; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }

    public String getParentPhone() { return parentPhone; }
    public void setParentPhone(String parentPhone) { this.parentPhone = parentPhone; }

    public Long getTeacherId() { return teacherId; }
    public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public static AdminSchoolUserCreateRequestBuilder builder() {
        return new AdminSchoolUserCreateRequestBuilder();
    }

    public static class AdminSchoolUserCreateRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String phone;
        private String schoolName;
        private String standard;
        private String division;
        private String rollNumber;
        private String parentName;
        private String parentPhone;
        private Long teacherId;
        private boolean active = true;

        public AdminSchoolUserCreateRequestBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public AdminSchoolUserCreateRequestBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public AdminSchoolUserCreateRequestBuilder email(String email) { this.email = email; return this; }
        public AdminSchoolUserCreateRequestBuilder password(String password) { this.password = password; return this; }
        public AdminSchoolUserCreateRequestBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminSchoolUserCreateRequestBuilder schoolName(String schoolName) { this.schoolName = schoolName; return this; }
        public AdminSchoolUserCreateRequestBuilder standard(String standard) { this.standard = standard; return this; }
        public AdminSchoolUserCreateRequestBuilder division(String division) { this.division = division; return this; }
        public AdminSchoolUserCreateRequestBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public AdminSchoolUserCreateRequestBuilder parentName(String parentName) { this.parentName = parentName; return this; }
        public AdminSchoolUserCreateRequestBuilder parentPhone(String parentPhone) { this.parentPhone = parentPhone; return this; }
        public AdminSchoolUserCreateRequestBuilder teacherId(Long teacherId) { this.teacherId = teacherId; return this; }
        public AdminSchoolUserCreateRequestBuilder active(boolean active) { this.active = active; return this; }

        public AdminSchoolUserCreateRequest build() {
            AdminSchoolUserCreateRequest r = new AdminSchoolUserCreateRequest();
            r.firstName = firstName;
            r.lastName = lastName;
            r.email = email;
            r.password = password;
            r.phone = phone;
            r.schoolName = schoolName;
            r.standard = standard;
            r.division = division;
            r.rollNumber = rollNumber;
            r.parentName = parentName;
            r.parentPhone = parentPhone;
            r.teacherId = teacherId;
            r.active = active;
            return r;
        }
    }
}
