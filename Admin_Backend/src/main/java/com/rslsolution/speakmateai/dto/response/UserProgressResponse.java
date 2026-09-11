package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProgressResponse {
    
    private int overallProgress; // Percentage 0-100
    private int lessonsCompleted;
    private int testsCompleted;
    private int totalLearningHours;
    private double completionPercentage;
    private int weeklyProgress; // Percentage or XP gained this week

}
