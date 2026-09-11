package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSchoolUserUpdateRequest {
    
    @NotBlank(message = "Student First name is required")
    private String firstName;
    
    @NotBlank(message = "Student Last name is required")
    private String lastName;
    
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
    private Boolean active;
}
