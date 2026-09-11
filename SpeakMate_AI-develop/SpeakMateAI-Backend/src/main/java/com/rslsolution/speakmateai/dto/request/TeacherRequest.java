package com.rslsolution.speakmateai.dto.request;

import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String password;

    @Pattern(regexp = "^$|^(?:\\+91)?[6-9]\\d{9}$", message = "Please enter a valid Indian mobile number")
    private String phone;
    
    private String employeeId;
    private String department;
    private String designation;
    private String experience;
    private String qualification;
    private Long schoolId;
}
