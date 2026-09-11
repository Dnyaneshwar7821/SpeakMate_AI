package com.rslsolution.speakmateai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatisticsResponse {
    
    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long todayRegistrations;
    private long thisWeekRegistrations;
    private long thisMonthRegistrations;
    
    // Add these fields later when premium features exist
    private long premiumUsers;
    private double averageLearningTimeMinutes;
    private double averageSpeakingScore;
}
