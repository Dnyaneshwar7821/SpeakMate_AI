package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.AdminStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminProfileResponse {
    
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String location;
    private String role;
    private AdminStatus status;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
