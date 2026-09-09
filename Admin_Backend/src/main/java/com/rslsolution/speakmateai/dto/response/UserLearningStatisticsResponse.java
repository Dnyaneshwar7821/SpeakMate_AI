package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLearningStatisticsResponse {
    
    private double practiceHours;
    private int speakingSessions;
    private int aiChats;
    private int completedLessons;
    private int currentStreak;
    private int xp;

}
