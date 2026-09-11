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
public class AdminUserDetailsUpdateRequest {
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    @Pattern(regexp = "^$|^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String phone;
    
    private String englishLevel;
    
    private boolean active;
}
