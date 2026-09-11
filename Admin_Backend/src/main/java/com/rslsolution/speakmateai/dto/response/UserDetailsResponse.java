package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDetailsResponse {
    
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String accountType; // e.g. STANDARD, SCHOOL
    private String englishLevel;
    private String status; // Active / Inactive
    private LocalDateTime registrationDate;
    private LocalDateTime lastActive;
    private Integer xp;
    private Integer currentStreak;

}
