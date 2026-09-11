package com.rslsolution.speakmateai.dto.response;

import java.time.LocalDateTime;

import com.rslsolution.speakmateai.enums.Role;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    
    // Basic Details
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String avatar;
    private Role role;
    private boolean active;
    
    // Learning Information
    private String nativeLanguage;
    private String englishLevel;
    private String learningGoal;
    private Integer dailyGoalMinutes;
    private String preferredVoice;
    private String preferredAccent;
    private String ageGroup;
    
    // Statistics & Metadata
    private int totalSpeakingSessions;
    private int totalGrammarSessions;
    private int totalVocabularySaved;
    private int totalLessonsCompleted;
    private int totalAchievements;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
