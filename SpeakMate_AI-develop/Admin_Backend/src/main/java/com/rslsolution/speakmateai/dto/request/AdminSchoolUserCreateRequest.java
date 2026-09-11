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
}
