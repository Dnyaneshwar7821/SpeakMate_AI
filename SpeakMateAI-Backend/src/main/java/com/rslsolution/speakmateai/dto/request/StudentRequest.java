package com.rslsolution.speakmateai.dto.request;

import com.rslsolution.speakmateai.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentRequest {
    private String firstName;
    private String lastName;
    private String email;
    private Long schoolId;
    private String standard;
    private String division;
    private String rollNumber;
    private String parentName;
    private String parentPhone;
    private String phone;
    private Long teacherId;
    private Boolean active;
    private Status status;
    private String password;
}
