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
public class AdminSchoolUserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    
    private String schoolName;
    private String standard;
    private String division;
    private String rollNumber;
    
    private String parentName;
    private String parentPhone;
    
    private Long teacherId;
    private String assignedTeacher;
    
    private boolean active;
    private LocalDateTime createdAt;
    
    // Progress statistics
    private long totalLessonsCompleted;
    private long totalSpeakingSessions;
    private long totalGrammarSessions;
    private long totalVocabularySaved;
}
